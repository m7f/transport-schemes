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
        const shapeFile = JSON.parse(fs.readFileSync(path.join(__dirname, `../route_data/${id}shape.json`)));
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
            } else {
                DATA.routes[id].trips.return.stops.push(stop.id)
            }
            DATA.stops[stop.id].status = 'active';
            ++iter;
        })
        tmp = 0
        shapeFile.features.forEach(line => {
            if (tmp === 0) {
                line.geometry.coordinates.forEach(dot => {
                    if (dir > 0 && dot[0] === routeFile.features[dir - 1].geometry.coordinates[0] &&
                        dot[1] === routeFile.features[dir - 1].geometry.coordinates[1]) {
                        tmp = 1;
                    }
                    DATA.routes[id].trips.direct.shape.push({
                        lat: Number(sm.inverse(dot)[1].toFixed(6)),
                        lon: Number(sm.inverse(dot)[0].toFixed(6)),
                    })
                })
            } else {
                line.geometry.coordinates.forEach(dot => {
                    if (dir > 0 && dot[0] === routeFile.features[dir - 1].geometry.coordinates[0] &&
                        dot[1] === routeFile.features[dir - 1].geometry.coordinates[1]) {
                        tmp = 1;
                    }
                    DATA.routes[id].trips.return.shape.push({
                        lat: Number(sm.inverse(dot)[1].toFixed(6)),
                        lon: Number(sm.inverse(dot)[0].toFixed(6)),
                    })
                })
            }
        })
        console.log(id + ' formatted!')
    })
    fs.writeFileSync(path.join(__dirname, '../../data.json'), JSON.stringify(DATA));
    console.log('DONE!')
}

module.exports = format();
