const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, generateDependencyReport } = require('@discordjs/voice');
const express = require('express');

// --- BAĞIMLILIK RAPORU (Hata Çözmek İçin Kritik) ---
console.log("--- SES SİSTEMİ RAPORU ---");
console.log(generateDependencyReport());
console.log("--------------------------");

const app = express();
app.get('/', (req, res) => res.send('Sistem Aktif.'));
app.listen(process.env.PORT || 3000);

const client = new Client({ checkUpdate: false });

client.on('ready', async () => {
    console.log(`>>> ${client.user.tag} sisteme giriş yaptı!`);
    connectToVoice();
});

async function connectToVoice() {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);

    if (!guild || !channel) {
        return console.error("Variables kısmında GUILD_ID veya CHANNEL_ID hatalı!");
    }

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfMute: true,
            selfDeaf: true,
            group: client.user.id
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log("!!! BAŞARILI: Şu an ses kanalındasın.");
        });

        connection.on('error', (error) => {
            console.error("Bağlantı hatası (Yeniden deneniyor):", error.message);
            // Şifreleme hatası olsa bile botun çökmesini engeller ve tekrar dener
            setTimeout(connectToVoice, 10000);
        });

    } catch (e) {
        console.error("Bağlantı başlatılamadı:", e);
        setTimeout(connectToVoice, 15000);
    }
}

client.login(process.env.TOKEN);
