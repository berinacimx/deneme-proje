const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

// --- Railway Uptime Sunucusu ---
const app = express();
app.get('/', (req, res) => res.send('Bot Aktif!'));
app.listen(process.env.PORT || 3000);

// --- Self-Bot Mantığı ---
const client = new Client({ checkUpdate: false });

client.on('ready', async () => {
    console.log(`${client.user.tag} başarıyla giriş yaptı!`);
    
    const connect = () => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const channel = client.channels.cache.get(process.env.CHANNEL_ID);

        if (guild && channel) {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfMute: true,
                selfDeaf: true
            });
            console.log("Ses kanalına bağlanıldı.");
        } else {
            console.log("Hata: Sunucu veya Kanal ID bulunamadı.");
        }
    };

    connect();
    // Bağlantı kopmalarına karşı her 10 dakikada bir kontrol
    setInterval(connect, 1000 * 60 * 10);
});

client.login(process.env.TOKEN);
