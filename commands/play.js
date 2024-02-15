const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  name: 'play',
  description: 'Plays the current radio station. Usage: $play',
  execute(message, args, { radioStations, joinVoiceChannel, createAudioPlayer }) {
    const currentStation = radioStations.find((station) => station.current);
    if (!currentStation) {
      return message.reply('No current station set.');
    }
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
  },
};
