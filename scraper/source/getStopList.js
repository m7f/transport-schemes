const fs = require('fs');
const path = require('path');

const IDS = JSON.parse(fs.readFileSync(path.join(__dirname, '../lists/id_list.json')));
const getStopList = () => {
    stop_list = {};
    IDS.forEach(id => {
        file = JSON.parse(fs.readFileSync(path.join(__dirname, `../route_data/${id}.json`)));
        file.features.forEach(stop => {
            stop_list[stop.id] = {
                lat: stop.geometry.coordinates[1],
                lon: stop.geometry.coordinates[0],
                title: stop.properties.name
            }
        })
    });
    fs.writeFileSync(path.join(__dirname, '../lists/stop_list.json'), JSON.stringify(stop_list, null, 4));
}

module.exports = getStopList();
