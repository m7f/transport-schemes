const fs = require('fs');
const path = require('path');
const SM = require('sphericalmercator');
var sm = new SM({
    size: 256
});

const IDS = JSON.parse(fs.readFileSync(path.join(__dirname, '../lists/id_list.json')));
const info = JSON.parse(fs.readFileSync(path.join(__dirname, '../lists/length_list.json')));

DATA = {
    routes: {},
    stops: JSON.parse(fs.readFileSync(path.join(__dirname, '../lists/stop_list.json'))),
};

format = () => {
    IDS.forEach(id =>  {
        const routeFile = JSON.parse(fs.readFileSync(path.join(__dirname, `../route_data/${id}.json`)));
        DATA.routes[id] = {
            id: info[id].name,
            type: routeFile.features[0].properties.transportType.systemName,
            trips: {
                direct: {
                    stops: [],
                    shape: [],
                },
                return: {
                    stops: [],
                    shape: [],
                },
            },
        }
        dir = info[id].dir;
        iter = 0;
        routeFile.features.forEach(stop => {
            if (iter < dir) {
                DATA.routes[id].trips.direct.stops.push(stop.id)
                DATA.routes[id].trips.direct.shape.push({
                    lat: Number(sm.inverse(stop.geometry.coordinates)[1].toFixed(6)),
                    lon: Number(sm.inverse(stop.geometry.coordinates)[0].toFixed(6)),
                })
            } else {
                DATA.routes[id].trips.return.stops.push(stop.id)
                DATA.routes[id].trips.return.shape.push({
                    lat: Number(sm.inverse(stop.geometry.coordinates)[1].toFixed(6)),
                    lon: Number(sm.inverse(stop.geometry.coordinates)[0].toFixed(6)),
                })
            }
            ++iter;
        })
        console.log(id + ' formatted!')
    })
    fs.writeFileSync(path.join(__dirname, '../../data.json'), JSON.stringify(DATA, null, 4));
    console.log('DONE!')
}

module.exports = format();
