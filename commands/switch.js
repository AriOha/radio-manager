const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  name: 'switch',
  description: 'Switch to specified radio station. Usage: $switch [name]',
  async execute(message, args, { radioStations, saveStations, joinVoiceChannel, createAudioPlayer, client }) {
    const stationName = args.join(' ');
    let found = false;

    radioStations.forEach((station) => {
      station.current = station.name === stationName;
      if (station.name === stationName) found = true;
    });

    if (!found) {
      return message.reply(`Station "${stationName}" not found.`);
    }

    saveStations(radioStations);
    message.reply(`Switched to "${stationName}" and set as current.`);

    const currentStation = radioStations.find((station) => station.current);
    if (message.member.voice.channel && currentStation) {
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
        message.reply(`Now playing "${currentStation.name}"!`);
      });

      player.on('error', (error) => {
        console.error(`Error: ${error.message}`);
        message.reply('Failed to play the station. Please try again later.');
      });

      // Update the global currentPlayer to the new player
      client.currentPlayer = player;
    }
  },
};
