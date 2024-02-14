const fs = require('fs');
const path = require('path');
const stationsFilePath = path.join(__dirname, 'stations.json');

const loadStations = () => {
  if (fs.existsSync(stationsFilePath)) {
    const rawData = fs.readFileSync(stationsFilePath);
    return JSON.parse(rawData);
  }
  return {};
};

const saveStations = (stations) => {
  fs.writeFileSync(stationsFilePath, JSON.stringify(stations, null, 2));
};

module.exports = { loadStations, saveStations };
