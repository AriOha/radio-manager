const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: 'stop',
  description: 'Stops the current playback and leaves the voice channel.',
  execute(message, args, { currentPlayer }) {
    if (currentPlayer) {
      currentPlayer.stop();
      console.log('Playback stopped.');
    }

    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
      console.log('Disconnected from the voice channel.');
    }

    message.reply('Stopped playback and left the voice channel.');
  },
};
