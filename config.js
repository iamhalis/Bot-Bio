require('dotenv').config(); // Bắt buộc phải có để đọc file .env

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    adminApiKey: process.env.ADMIN_API_KEY,
    webApiUrl: process.env.WEB_API_URL
};