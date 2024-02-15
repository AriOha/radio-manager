module.exports = {
  name: 'add',
  description: 'Adds a new radio station. Usage: $add [name] [URL]',
  execute(message, args, { radioStations, saveStations }) {
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
  },
};
