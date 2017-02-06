const fs = require('fs');

const IDS = JSON.parse(fs.readFileSync('./lists/id_list.json'));
const info = JSON.parse(fs.readFileSync('./lists/length_list.json'));
const JSON_stops = fs.readFileSync('./lists/stop_list.json');

DATA = '{"routes":{';

const formatStop = require('./formatStop.js')

formatRoute = (id) => {
    const routeFile = JSON.parse(fs.readFileSync('./route_data/' + id + '.json'));
    stops_dir = [];
    stops_ret = [];
    coords_dir = [];
    coords_ret = [];
    dir = info[id]['dir'];
    ret = info[id]['ret'];
    name = info[id]['name'];
    transport = routeFile['features'][0]['properties']['transportType']['name'];
    iter = 0;
    while (iter < dir) {
        stops_dir.push(routeFile['features'][iter]['properties']['name']);
        coords_dir.push(routeFile['features'][iter]['geometry']['coordinates']);
        iter += 1;
    }
    iter -= 1;
    while (iter < dir + ret - 2) {
        stops_ret.push(routeFile['features'][iter]['properties']['name']);
        coords_ret.push(routeFile['features'][iter]['geometry']['coordinates']);
        iter += 1;
    }

    JSON_stops_dir = '"stops":[';
    JSON_stops_ret = '"stops":[';
    stops_dir.forEach(elem => {
        JSON_stops_dir += '"' + formatStop(elem) + '",';
    });
    JSON_stops_dir = (JSON_stops_dir).slice(0, JSON_stops_dir.length - 1) +  '],';
    stops_ret.forEach(elem => {
        JSON_stops_ret += '"' + formatStop(elem) + '",';
    });
    JSON_stops_ret = (JSON_stops_ret).slice(0, JSON_stops_ret.length - 1) +  '],';

    JSON_shape_dir = '"shape":[';
    JSON_shape_ret = '"shape":[';
    coords_dir.forEach(elem => {
        JSON_shape_dir += '{"lat":' + elem[1] + ',"lon":' + elem[0] + '},';
    });
    JSON_shape_dir = (JSON_shape_dir).slice(0, JSON_shape_dir.length - 1) +  ']';
    coords_ret.forEach(elem => {
        JSON_shape_ret += '{"lat":' + elem[1] + ',"lon":' + elem[0] + '},';
    });
    JSON_shape_ret = (JSON_shape_ret).slice(0, JSON_shape_ret.length - 1) +  ']';

    JSON_trip_dir = '"' + id + 'direct":{' + JSON_stops_dir + JSON_shape_dir + '}';
    JSON_trip_ret = '"' + id + 'return":{' + JSON_stops_ret + JSON_shape_ret + '}';

    JSON_trips = '"trips":{';
    if (stops_dir.length > 0) {
        JSON_trips += JSON_trip_dir + ',';
    }
    if (stops_ret.length > 0) {
        JSON_trips += JSON_trip_ret;
    } else if (stops_dir.length > 0) {
        JSON_trips = (JSON_trips).slice(0, JSON_trips.length - 1);
    }
    JSON_trips += '}';

    JSON_route = '"' + id + '":{"id":"' + name + '",' +
    '"transport":"' + transport + '",' + JSON_trips + '}';

    DATA += JSON_route +  ',';
}

const format = () => {
    IDS.forEach(id => {
        console.log('route ' + id + ' formatted')
        formatRoute(id);
    });
    DATA = (DATA).slice(0, DATA.length - 1) + '},"stops":' + JSON.stringify(JSON.parse(JSON_stops)) + '}';
    if (!fs.existsSync('./output')) {
        fs.mkdirSync('./output');
    }
    fs.writeFileSync('./output/data.json', JSON.stringify(JSON.parse(DATA), null, 4));
    console.log('DONE!')
}

module.exports = format();
