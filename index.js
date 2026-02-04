import { Client, GatewayIntentBits } from "discord.js";
import {
  joinVoiceChannel,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus
} from "@discordjs/voice";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

async function connectVoice(guild) {
  const existing = getVoiceConnection(guild.id);
  if (existing) return;

  try {
    const connection = joinVoiceChannel({
      channelId: process.env.VOICE_CHANNEL_ID,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: true,
      selfDeaf: false,
      encryptionMode: "aead_xchacha20_poly1305_rtpsize"
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    console.log("🔊 Ses kanalına bağlandı");
  } catch (err) {
    console.error("❌ Ses bağlantı hatası:", err);
    setTimeout(() => connectVoice(guild), 5000);
  }
}

client.once("ready", async () => {
  console.log(`🟢 Aktif: ${client.user.tag}`);

  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  connectVoice(guild);
});

client.on("voiceStateUpdate", (_, newState) => {
  if (
    newState.id === client.user.id &&
    newState.channelId !== process.env.VOICE_CHANNEL_ID
  ) {
    console.log("⚠️ Sesten atıldı, geri giriliyor");
    setTimeout(() => connectVoice(newState.guild), 3000);
  }
});

/* ---- CRASH KORUMASI ---- */
process.on("unhandledRejection", err => {
  console.error("UnhandledRejection:", err);
});

process.on("uncaughtException", err => {
  console.error("UncaughtException:", err);
});

client.login(process.env.TOKEN);
