const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'list',
  description: 'Lists all available radio stations.',
  execute(message, args, { radioStations }) {
    // Start building the description string with Markdown for a list
    let description = 'Here are the available radio stations:\n';

    radioStations.forEach((station, index) => {
      // Mark the current station with a special indicator, e.g., "🔊" or "**[Current]**"
      const isCurrent = station.current ? '🔊' : '';
      // Append each station as a list item, without URL, and mark the current station
      description += `${index + 1}. ${station.name} ${isCurrent}\n`;
    });

    // Create the embed with the compiled description
    const embed = new EmbedBuilder()
      .setTitle('Radio Stations')
      .setDescription(description)
      .setColor(0x0099ff); // Use a color that fits your bot's theme

    // Send the embed
    message.channel.send({ embeds: [embed] });
  },
};
