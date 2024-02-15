module.exports = {
  name: 'join',
  description: 'Joins the voice channel you are currently in.',
  execute(message, args, { joinVoiceChannel }) {
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
  },
};
