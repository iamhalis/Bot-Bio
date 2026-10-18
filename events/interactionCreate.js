const { Events, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Nếu không phải là Slash Command (/), bỏ qua
        if (!interaction.isChatInputCommand()) return;

        // Kiểm tra quyền hạn Quản trị viên (Administrator)
        if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: '🚫 Xin lỗi, chỉ có Quản trị viên máy chủ mới được phép sử dụng bot này!', 
                ephemeral: true 
            });
        }

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Không tìm thấy lệnh nào khớp với /${interaction.commandName}.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Lỗi khi thực thi lệnh /${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Có lỗi xảy ra khi thực thi lệnh này!', ephemeral: true });
            } else {
                await interaction.reply({ content: '❌ Có lỗi xảy ra khi thực thi lệnh này!', ephemeral: true });
            }
        }
    }
};