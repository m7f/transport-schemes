const fs = require('fs');
const formatStop = require('./formatStop.js')
const IDS = JSON.parse(fs.readFileSync('./lists/id_list.json'));

const getStopList = () => {
    stop_list = '{';
    IDS.forEach(id => {
        file = JSON.parse(fs.readFileSync('./route_data/' + id + '.json'));
        file['features'].forEach(stop => {
            stop_list += '"' + stop['id'] + '":{"lat":' +
            stop['geometry']['coordinates'][0] + ',"lon":' +
            stop['geometry']['coordinates'][1] + ',"title":"' +
            formatStop(stop['properties']['name']) + '"},'
        })
    });
    stop_list = (stop_list).slice(0, stop_list.length - 1) + '}';
    fs.writeFileSync('./lists/stop_list.json', JSON.stringify(JSON.parse(stop_list), null, 4));
}

module.exports = getStopList();
