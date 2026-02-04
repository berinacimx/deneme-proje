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

let reconnecting = false;

async function connectVoice(guild) {
  if (reconnecting) return;

  const existing = getVoiceConnection(guild.id);
  if (existing) return;

  reconnecting = true;

  try {
    const connection = joinVoiceChannel({
      channelId: process.env.VOICE_CHANNEL_ID,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: true,
      selfDeaf: false
    });

    connection.on("error", err => {
      console.error("🎤 Voice error:", err.message);
      safeReconnect(guild);
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    console.log("🔊 Ses kanalına bağlandı");
  } catch (err) {
    console.error("❌ Bağlanma hatası:", err.message);
    setTimeout(() => {
      reconnecting = false;
      connectVoice(guild);
    }, 5000);
  }

  reconnecting = false;
}

function safeReconnect(guild) {
  if (reconnecting) return;

  reconnecting = true;
  console.log("🔁 Reconnect başlatıldı");

  try {
    const conn = getVoiceConnection(guild.id);
    if (conn) conn.destroy();
  } catch {}

  setTimeout(() => {
    reconnecting = false;
    connectVoice(guild);
  }, 4000);
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
    console.log("⚠️ Sesten atıldı");
    safeReconnect(newState.guild);
  }
});

/* GLOBAL KORUMA */
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.login(process.env.TOKEN);
