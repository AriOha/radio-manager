const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Shows all the available commands and their descriptions.',
  execute(message, args, { client }) {
    // Create an embed
    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Help - Commands List')
      .setDescription('Here are the commands you can use:')
      .setTimestamp()
      .setFooter({ text: 'Bot Help Command', iconURL: 'https://example.com/icon.png' }); // TBD: add bot's icon

    // Dynamically add each command to the embed
    client.commands.forEach((command) => {
      helpEmbed.addFields({ name: `$${command.name}`, value: `${command.description}`, inline: false });
    });

    message.channel.send({ embeds: [helpEmbed] });
  },
};
