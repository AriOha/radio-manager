require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, generateDependencyReport } = require('@discordjs/voice');

const { loadStations, saveStations } = require('./stationManager');

const commandPrefix = process.env.COMMAND_PREFIX;

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
client.commands = new Map();
client.radioStations = loadStations();
client.currentPlayer = null; // Global player reference

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(commandPrefix)) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    // Pass the necessary dependencies or context as the third argument
    command.execute(message, args, {
      radioStations: client.radioStations,
      saveStations,
      joinVoiceChannel,
      createAudioPlayer,
      client, // Passing client itself for currentPlayer manipulation or other needs
    });
  } catch (error) {
    console.error(error);
    message.reply('There was an error executing that command.');
  }
});

client.login(process.env.TOKEN);
