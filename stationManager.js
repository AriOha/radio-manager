const fs = require('fs');
const path = require('path');
const stationsFilePath = path.join(__dirname, 'stations.json');

const loadStations = () => {
  if (fs.existsSync(stationsFilePath)) {
    const rawData = fs.readFileSync(stationsFilePath);
    const data = JSON.parse(rawData);
    return data.stations;
  }
  return [];
};

const saveStations = (stations) => {
  const data = { stations };
  fs.writeFileSync(stationsFilePath, JSON.stringify(data, null, 2));
};

module.exports = { loadStations, saveStations };
