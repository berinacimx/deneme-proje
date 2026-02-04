const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

// --- AYARLAR (Railway Variables'dan gelecek) ---
const TOKEN = process.env.TOKEN;      // Kullanıcı Tokeni (User Token)
const GUILD_ID = process.env.GUILD_ID; // Sunucu ID
const CHANNEL_ID = process.env.CHANNEL_ID; // Ses Kanalı ID

// --- UPTIME İÇİN WEB SUNUCUSU ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Self-bot ses kanalında aktif!');
});

app.listen(PORT, () => {
    console.log(`Uptime sunucusu çalışıyor: Port ${PORT}`);
});

// --- SELF-BOT İŞLEMLERİ ---
const client = new Client({
    checkUpdate: false // Konsolda güncelleme uyarısı vermemesi için
});

client.on('ready', async () => {
    console.log(`${client.user.username} hesabına giriş yapıldı!`);
    
    joinChannel();
    
    // Bağlantı koparsa diye periyodik kontrol (30 dakikada bir)
    setInterval(joinChannel, 1000 * 60 * 30);
});

async function joinChannel() {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return console.log("HATA: Sunucu bulunamadı veya hesaba erişimi yok.");

    const channel = guild.channels.cache.get(CHANNEL_ID);
    if (!channel) return console.log("HATA: Kanal bulunamadı.");

    try {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false, // İstersen false yapıp duyabilirsin
            selfMute: true   // Mikrofon kapalı görünsün
        });
        console.log("Ses kanalına başarıyla giriş yapıldı.");
    } catch (error) {
        console.error("Bağlantı hatası:", error);
    }
}

client.login(TOKEN);