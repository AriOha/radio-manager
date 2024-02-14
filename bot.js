require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');
const { generateDependencyReport } = require('@discordjs/voice');
console.log(generateDependencyReport());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// In-memory storage for radio stations
let radioStations = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'hello':
      message.reply('Hello there! How can I assist you today?');
      break;
    case 'join-me':
      if (message.member.voice.channel) {
        joinVoiceChannel({
          channelId: message.member.voice.channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
        });
        message.reply("I've joined your voice channel!");
      } else {
        message.reply('You need to be in a voice channel for me to join you!');
      }
      break;
    case 'addstation':
      const [name, ...urlParts] = args;
      const url = urlParts.join(' ');
      radioStations[name] = url;
      message.reply(`Radio station "${name}" added.`);
      break;

    case 'deletestation':
      const stationName = args.join(' ');
      if (radioStations[stationName]) {
        delete radioStations[stationName];
        message.reply(`Radio station "${stationName}" deleted.`);
      } else {
        message.reply(`Radio station "${stationName}" not found.`);
      }
      break;

    case 'liststations':
      if (Object.keys(radioStations).length === 0) {
        message.reply('No radio stations available.');
      } else {
        const list = Object.entries(radioStations)
          .map(([name, url]) => `- ${name}: ${url}`)
          .join('\n');
        message.reply(`Radio Stations:\n${list}`);
      }
      break;

    case 'playstation':
      const playName = args.join(' ');
      const stationUrl = radioStations[playName];
      if (stationUrl && message.member.voice.channel) {
        const voiceChannel = message.member.voice.channel;
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(stationUrl);
        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Playing, () => {
          message.reply(`Now playing "${playName}"!`);
        });

        player.on('error', (error) => {
          console.error(`Error: ${error.message}`);
          message.reply('Failed to play the station. Please try again later.');
        });
      } else if (!stationUrl) {
        message.reply(`Radio station "${playName}" not found.`);
      } else {
        message.reply('You need to be in a voice channel for me to play a station!');
      }
      break;
    case 'stop-radio':
      if (currentPlayer) {
        currentPlayer.stop(); // Stop the audio player
        currentPlayer = null; // Reset the player reference
      }
      if (currentVoiceConnection) {
        currentVoiceConnection.destroy(); // Disconnect the bot from the voice channel
        currentVoiceConnection = null; // Reset the voice connection reference
      }
      message.reply('Stopped playback and left the voice channel.');
      break;
  }
});

client.login(process.env.TOKEN);
