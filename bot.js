require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');
const { generateDependencyReport } = require('@discordjs/voice');

const { loadStations, saveStations } = require('./stationManager');
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
let radioStations = loadStations();

const commands = {
  $add: 'Adds a new radio station. Usage: $add [name] [URL]',
  $delete: 'Deletes an existing radio station. Usage: $delete [name]',
  $list: 'Lists all available radio stations.',
  $play: 'Plays the current radio station. Usage: $play',
  $switch: 'Switch to specified radio station. Usage: $switch [name]',
  $stop: 'Stops the current playback and leaves the voice channel.',
  $join: 'Joins the voice channel you are currently in.',
  $hello: 'Greets the user.',
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('$')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'hello':
      message.reply(`Hello ${message.author.displayName}!\nHow can I assist you today?`);

      break;

    case 'join': {
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
    }

    case 'add': {
      const name = args[0];
      const url = args[1];

      // Check if the station already exists
      const existingIndex = radioStations.findIndex((station) => station.name === name);
      if (existingIndex !== -1) {
        message.reply(`Station "${name}" already exists.`);
        return;
      }

      const isCurrent = radioStations.length === 0 ? true : false;

      // Add the new station
      radioStations.push({
        name: name,
        url: url,
        current: isCurrent, // This will be false unless explicitly set
      });

      saveStations(radioStations);
      message.reply(`Radio station "${name}" added.`);
      break;
    }

    case 'delete': {
      const name = args.join(' '); // Assuming the station name can have spaces
      const stationIndex = radioStations.findIndex((station) => station.name === name);

      if (stationIndex === -1) {
        message.reply(`Station "${name}" not found.`);
        return;
      }

      // Check if the station to be deleted is the current one
      const isCurrent = radioStations[stationIndex].current;
      radioStations.splice(stationIndex, 1); // Remove the station from the array

      // Optionally, select a new current station if the deleted one was current
      if (isCurrent && radioStations.length > 0) {
        radioStations[0].current = true; // Example: making the first station the new current
        message.reply(`Station "${name}" deleted. "${radioStations[0].name}" is now the current station.`);
      } else {
        message.reply(`Station "${name}" deleted.`);
      }

      saveStations(radioStations); // Save the updated list of stations

      break;
    }

    case 'list': {
      if (radioStations.length === 0) {
        message.reply('No radio stations available.');
      } else {
        const list = radioStations
          .map(({ name, current }) => {
            return `- ${name} ${current ? '(current)' : ''}`;
          })
          .join('\n');
        message.reply(`Radio Stations:\n${list}`);
      }
      break;
    }

    case 'play': {
      const currentStation = radioStations.find((station) => station.current);
      if (currentStation) {
        if (currentStation.url && message.member.voice.channel) {
          const voiceChannel = message.member.voice.channel;
          const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });

          const player = createAudioPlayer();
          const resource = createAudioResource(currentStation.url);
          player.play(resource);
          connection.subscribe(player);

          player.on(AudioPlayerStatus.Playing, () => {
            message.reply(`Now playing ${currentStation.name}!`);
          });

          player.on('error', (error) => {
            console.error(`Error: ${error.message}`);
            message.reply('Failed to play the station. Please try again later.');
          });
        } else if (!currentStation.url) {
          message.reply(`Radio station "${currentStation.name}" not found.`);
        } else {
          message.reply('You need to be in a voice channel for me to play a station!');
        }
      } else {
        message.reply('No current station set.');
      }
      break;
    }

    case 'switch': {
      const stationName = args.join(' ');
      let found = false;
      radioStations.forEach((station) => {
        if (station.name === stationName) {
          station.current = true;
          found = true;
        } else {
          station.current = false;
        }
      });

      if (found) {
        saveStations(radioStations); // Make sure to update the JSON file
        message.reply(`Switched to "${stationName}" and set as current.`);
      } else {
        message.reply(`Station "${stationName}" not found.`);
      }
      break;
    }

    case 'stop': {
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

    case 'help': {
      let helpMessage = 'Try my commands:\n';
      for (const [cmd, description] of Object.entries(commands)) {
        helpMessage += `\`${cmd}\`: ${description}\n`;
      }
      message.reply({ content: helpMessage, allowedMentions: { repliedUser: false } });
      break;
    }
  }
});

client.login(process.env.TOKEN);
