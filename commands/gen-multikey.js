const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { adminApiKey, webApiUrl } = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen-multikey')
        .setDescription('Tạo nhiều key kích hoạt Bio-link cùng lúc cho người dùng')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('soluong')
                .setDescription('Số lượng key cần tạo (từ 1 đến 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const amount = interaction.options.getInteger('soluong');
        const cleanBaseUrl = (webApiUrl || 'http://localhost:3000').replace(/\/+$/, '');

        try {
            let keys = [];

            // Thử gọi endpoint tạo nhiều key
            const response = await fetch(`${cleanBaseUrl}/api/admin/generate-multikey`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': adminApiKey
                },
                body: JSON.stringify({ amount })
            });

            if (response.ok) {
                const data = await response.json();
                keys = data.keys || [];
            } else if (response.status === 404) {
                // Cơ chế dự phòng (fallback) nếu Web Server chưa cập nhật endpoint mới: gọi generate-key song song
                const promises = [];
                for (let i = 0; i < amount; i++) {
                    promises.push(
                        fetch(`${cleanBaseUrl}/api/admin/generate-key`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-api-key': adminApiKey
                            }
                        }).then(async r => {
                            if (!r.ok) throw new Error(`HTTP ${r.status}`);
                            const d = await r.json();
                            return d.key;
                        })
                    );
                }
                keys = await Promise.all(promises);
            } else {
                return interaction.followUp({
                    content: `❌ Máy chủ Web từ chối yêu cầu tạo key (HTTP ${response.status}: Kiểm tra ADMIN_API_KEY).`,
                    ephemeral: true
                });
            }

            if (!keys || keys.length === 0) {
                return interaction.followUp({
                    content: '❌ Không nhận được key nào từ máy chủ web.',
                    ephemeral: true
                });
            }

            const totalKeys = keys.length;
            const previewLimit = 25;
            const previewKeys = keys.slice(0, previewLimit).join('\n');

            let messageContent = `🔑 **Đã tạo thành công ${totalKeys} key kích hoạt BioLink:**\n\`\`\`\n${previewKeys}\n\`\`\``;

            if (totalKeys > previewLimit) {
                messageContent += `\n*(Đang hiển thị ${previewLimit}/${totalKeys} key ở trên. Xem toàn bộ danh sách trong file đính kèm)*`;
            }

            messageContent += `\n👉 Gửi mã cho thành viên để họ nhập vào trang kích hoạt: ${cleanBaseUrl}/redeem`;

            const textBuffer = Buffer.from(keys.join('\r\n'), 'utf-8');
            const fileAttachment = new AttachmentBuilder(textBuffer, {
                name: `biolink-keys-${totalKeys}keys-${Date.now()}.txt`
            });

            try {
                return await interaction.followUp({
                    content: messageContent,
                    files: [fileAttachment],
                    ephemeral: true
                });
            } catch (err) {
                // Nếu client hoặc kênh không hỗ trợ tệp đính kèm trong ephemeral, gửi nội dung chữ
                return await interaction.followUp({
                    content: messageContent,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Lỗi khi thực thi /gen-multikey:', error.message);
            return interaction.followUp({
                content: `❌ Không thể tạo key: ${error.message}. Hãy chắc chắn Web Server đang hoạt động!`,
                ephemeral: true
            });
        }
    },
};
