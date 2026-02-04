const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

// --- 1. UPTIME SUNUCUSU ---
const app = express();
app.get('/', (req, res) => res.send('Sistem Aktif!'));
app.listen(process.env.PORT || 3000, () => console.log("Web portu hazır."));

// --- 2. SELF-BOT AYARLARI ---
const client = new Client({ checkUpdate: false });

client.on('ready', async () => {
    console.log(`${client.user.tag} giriş yaptı!`);
    
    const stayInVoice = () => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const channel = client.channels.cache.get(process.env.CHANNEL_ID);

        if (!guild || !channel) {
            console.error("ID'ler hatalı veya kanal bulunamadı!");
            return;
        }

        try {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfMute: true, // Mikrofon kapalı
                selfDeaf: true  // Sağırlaştırma açık (veri tasarrufu)
            });
            console.log(`[${new Date().toLocaleTimeString()}] Ses kanalına bağlanıldı.`);
        } catch (err) {
            console.error("Bağlantı hatası:", err);
        }
    };

    stayInVoice();
    // Her 15 dakikada bir bağlantıyı tazeler (Railway uyku modunu engeller)
    setInterval(stayInVoice, 1000 * 60 * 15);
});

// Railway Variables kısmına gireceğin TOKEN ile giriş yapar
client.login(process.env.TOKEN);
