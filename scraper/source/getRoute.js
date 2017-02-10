const request = require('request');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const IDS = JSON.parse(fs.readFileSync(path.join(__dirname, '../lists/id_list.json')));

if (!fs.existsSync(path.join(__dirname, '../route_data'))) {
    fs.mkdirSync(path.join(__dirname, '../route_data'));
}

arr = {};

const getRouteLength = (id, t) => {
    const url = `http://transport.orgp.spb.ru/Portal/transport/route/${id}/schedule`;
    request({
        url,
    }, (err, res, body) => {
        dir = 0;
        const $ = cheerio.load(body);
        $('#direct-stops-list li')
        .each(function () {
            ++dir;
        });
        $('body > div.container > div.wrapper > div.content.innerpage > h4')
        .each(function () {
            name = $(this).text().split(' ')[3];
        })
        arr[id] = {
            name: name,
            dir: dir,
        }
        t();
    })
};

const getRoute = (id, t) => {
    const url = `http://transport.orgp.spb.ru/Portal/transport/map/poi?ROUTE=${id}&REQUEST=GetFeature`;
    request({
        url,
        headers: {
            'Referer': 'http://transport.orgp.spb.ru/Portal/transport/main',
        },
    }, (err, res, body) => {
        fs.writeFileSync(path.join(__dirname, `../route_data/${id}.json`), JSON.stringify(JSON.parse(body), null, 4));
        getRouteLength(id, t);
    });
};

const getAllRoutes = (i) => {
    if (i >= IDS.length) {
        fs.writeFileSync(path.join(__dirname, '../lists/length_list.json'), JSON.stringify(arr, null, 4));
        const getSTOPS = require(path.join(__dirname, 'getStopList.js'));
        getSTOPS;
        const startFORMAT = require(path.join(__dirname, 'format.js'));
        startFORMAT;
        return;
    }
    const next = () => {
        setTimeout(() => getAllRoutes(i + 1), 100);
    };
    console.log(`${i + 1}/${IDS.length} routes collected`);
    getRoute(IDS[i], next);
}

module.exports = getAllRoutes(0);
