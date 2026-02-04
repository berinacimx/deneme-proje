const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

// Express Kurulumu (Railway'in kapanmaması için)
const app = express();
app.get('/', (req, res) => res.send('Bot Canlı!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ checkUpdate: false });

client.on('ready', async () => {
    console.log(`${client.user.tag} aktif!`);
    
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
            console.log("Ses kanalına girildi.");
        }
    };

    connect();
    // Her 20 dakikada bir bağlantıyı tazele (Düşmeyi önler)
    setInterval(connect, 1000 * 60 * 20);
});

client.login(process.env.TOKEN);
