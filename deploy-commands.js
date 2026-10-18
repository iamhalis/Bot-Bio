const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Đọc trực tiếp tất cả file .js bên trong thư mục commands
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[CẢNH BÁO] Lệnh tại ${filePath} bị thiếu thuộc tính "data" hoặc "execute".`);
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Bắt đầu tải lên ${commands.length} lệnh (/) lên máy chủ Discord...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`✅ Thành công! Đã tải ${data.length} lệnh lên máy chủ.`);
    } catch (error) {
        console.error('Lỗi khi tải lệnh:', error);
    }
})();