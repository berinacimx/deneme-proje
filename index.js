const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, enterState } = require('@discordjs/voice');
const express = require('express');

// --- UPTIME SERVER ---
const app = express();
app.get('/', (req, res) => res.send('Sistem Aktif ve Stabil.'));
app.listen(process.env.PORT || 3000);

// --- SELF-BOT SETUP ---
const client = new Client({ checkUpdate: false });

client.on('ready', async () => {
    console.log(`>>> Giriş Yapıldı: ${client.user.tag}`);
    keepVoiceActive();
});

async function keepVoiceActive() {
    const GUILD_ID = process.env.GUILD_ID;
    const CHANNEL_ID = process.env.CHANNEL_ID;

    const guild = client.guilds.cache.get(GUILD_ID);
    const channel = client.channels.cache.get(CHANNEL_ID);

    if (!guild || !channel) {
        console.error("HATA: Sunucu veya Kanal ID bulunamadı. Lütfen Variables kısmını kontrol edin.");
        return;
    }

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfMute: true,
            selfDeaf: true,
        });

        // Bağlantı durumlarını izle ve koparsa yeniden bağlan
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    enterState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    enterState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch (error) {
                console.log("Bağlantı koptu, 5 saniye sonra tekrar deneniyor...");
                setTimeout(keepVoiceActive, 5000);
            }
        });

        console.log(`[${new Date().toLocaleTimeString()}] Ses kanalına başarıyla bağlandı.`);
    } catch (err) {
        console.error("Kritik Bağlantı Hatası:", err);
        setTimeout(keepVoiceActive, 10000);
    }
}

client.login(process.env.TOKEN);
