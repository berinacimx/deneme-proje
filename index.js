const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, generateDependencyReport } = require('@discordjs/voice');
const express = require('express');

// --- BAĞIMLILIK RAPORU ---
// Bu çıktı sayesinde Railway loglarında hangi kütüphanenin eksik olduğunu görebiliriz.
console.log("--- SES SİSTEMİ DURUM RAPORU ---");
console.log(generateDependencyReport());
console.log("--------------------------------");

const app = express();
app.get('/', (req, res) => res.send('Ses Sistemi Aktif!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ checkUpdate: false });

client.on('ready', async () => {
    console.log(`>>> Giriş başarılı: ${client.user.tag}`);
    
    const baglan = () => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const channel = client.channels.cache.get(process.env.CHANNEL_ID);

        if (!guild || !channel) {
            console.error("ID'ler hatalı! Lütfen Variables kısmını kontrol edin.");
            return;
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfMute: true,
            selfDeaf: true,
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log("!!! BAĞLANTI KURULDU: Şu an ses kanalındasın.");
        });

        // Hata durumunda (Şifreleme hatası dahil) botu ayakta tutar
        connection.on('error', (err) => {
            console.error("Ses Bağlantı Hatası:", err.message);
            if (err.message.includes('encryption modes')) {
                console.log("Şifreleme sorunu algılandı, yeniden deneme başlatılıyor...");
            }
            setTimeout(baglan, 10000); // 10 saniye sonra tekrar dene
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log("Bağlantı koptu, yeniden bağlanılıyor...");
            setTimeout(baglan, 5000);
        });
    };

    baglan();
});

client.login(process.env.TOKEN);
