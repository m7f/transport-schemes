const fs = require('fs');
const path = require('path');
const request = require('request');
const SM = require('sphericalmercator');
var sm = new SM({
    size: 256
});

if (!fs.existsSync(path.join(__dirname, '../lists'))) {
    fs.mkdirSync(path.join(__dirname, '../lists'));
}

const getIdList = () => {
    request({
        url: 'http://transport.orgp.spb.ru/Portal/transport/routes/list',
        body: 'sEcho=1&iColumns=11&sColumns=id%2CtransportType%2CrouteNumber&' +
        'iDisplayStart=0&iDisplayLength=1000&iSortingCols=1&iSortCol_0=2&' +
        'sSortDir_0=asc&transport-type=0&transport-type=46&transport-type=2&transport-type=1',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }
    }, (err, res, body) => {
        data = JSON.parse(body).aaData.map(stop => stop[0]);
        fs.writeFileSync(path.join(__dirname, '../lists/id_list.json'), JSON.stringify(data, null, 4));
        console.log(data.length + " routes IDs collected");
        request({
            url: 'http://transport.orgp.spb.ru/Portal/transport/stops/list',
            body: 'sEcho=1&iColumns=7&sColumns=id%2Cname%2ClonLat&iDisplayStart=0&' +
            'iDisplayLength=10000&iSortingCols=1&iSortCol_0=0&sSortDir_0=asc&' +
            'transport-type=0&transport-type=46&transport-type=2&transport-type=1',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            }
        }, (err, res, body) => {
            data = {};
            JSON.parse(body).aaData.forEach(stop => {
                data[stop[0]] = {
                    lat: Number(sm.inverse([stop[2].lon, stop[2].lat])[1].toFixed(6)),
                    lon: Number(sm.inverse([stop[2].lon, stop[2].lat])[0].toFixed(6)),
                    title: stop[1]
                }
            })
            fs.writeFileSync(path.join(__dirname, '../lists/stop_list.json'), JSON.stringify(data, null, 4));
            console.log(Object.keys(data).length + " stops IDs collected");
            const get_routes = require(path.join(__dirname, '/getRoute.js'));
            get_routes;
        })
    })
};

module.exports = getIdList();
