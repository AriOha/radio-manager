module.exports = {
  name: 'delete',
  description: 'Deletes an existing radio station. Usage: $delete [name]',
  execute(message, args, { radioStations, saveStations }) {
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
  },
};
