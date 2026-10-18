const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { adminApiKey, webApiUrl } = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('genkey')
        .setDescription('Tạo key kích hoạt Bio-link mới cho người dùng')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const cleanBaseUrl = (webApiUrl || 'http://localhost:3000').replace(/\/+$/, '');

        try {
            const response = await fetch(`${cleanBaseUrl}/api/admin/generate-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': adminApiKey
                }
            });

            if (!response.ok) {
                return interaction.followUp({ 
                    content: `❌ Máy chủ Web từ chối yêu cầu tạo key (HTTP ${response.status}: Kiểm tra ADMIN_API_KEY).`, 
                    ephemeral: true 
                });
            }

            const data = await response.json();
            return interaction.followUp({
                content: `🔑 **Key kích hoạt BioLink mới:**\n\`\`\`\n${data.key}\n\`\`\`\n👉 Gửi mã này cho thành viên để họ nhập vào trang kích hoạt: ${cleanBaseUrl}/redeem`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Lỗi gọi Web API tạo key:', error.message);
            return interaction.followUp({
                content: `❌ Không thể kết nối tới Web Server tại \`${cleanBaseUrl}\`. Hãy chắc chắn Web Server đang chạy!`,
                ephemeral: true
            });
        }
    },
};