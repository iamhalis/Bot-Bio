const { SlashCommandBuilder } = require('discord.js');
const { webApiUrl } = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Kiểm tra độ trễ của Bot và kết nối tới Web Server'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const botPing = interaction.client.ws.ping;
        const cleanBaseUrl = (webApiUrl || 'http://localhost:3000').replace(/\/+$/, '');
        
        let webStatus = '🔴 Không thể kết nối';
        let webLatency = 0;

        try {
            const start = Date.now();
            const res = await fetch(`${cleanBaseUrl}/login`);
            webLatency = Date.now() - start;
            if (res.ok) {
                webStatus = `🟢 Hoạt động (${webLatency}ms)`;
            } else {
                webStatus = `🟡 Phản hồi mã lỗi ${res.status} (${webLatency}ms)`;
            }
        } catch (e) {
            webStatus = `🔴 Mất kết nối: ${e.message}`;
        }

        return interaction.followUp({
            content: `🏓 **Bot Pong:** \`${botPing}ms\`\n🌐 **Web Server (${cleanBaseUrl}):** ${webStatus}`,
            ephemeral: true
        });
    }
};
