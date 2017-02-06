const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');

const IDS = JSON.parse(fs.readFileSync('./lists/id_list.json'));

if (!fs.existsSync('./route_data')) {
    fs.mkdirSync('./route_data');
}

arr = '{';

const getRouteLength = (id) => {
    const url = 'http://transport.orgp.spb.ru/Portal/transport/route/' + id + '/schedule';
    request({
        url,
    }, (err, res, body) => {
        dir = 0;
        ret = 0;
        name = '';
        const $ = cheerio.load(body);
        $('#direct-stops-list li')
        .each(function () {
            dir += 1;
        });
        $('#return-stops-list li')
        .each(function () {
            ret += 1;
        });
        $('body > div.container > div.wrapper > div.content.innerpage > h4')
        .each(function () {
            name = $(this).text().split(' ')[3];
        })
        arr += '"' + id + '"' + ':{' + '"name":"' + name + '","dir":' + dir + ',"ret":' + ret + '},'
    });
};

const getRoute = (id, t) => {
    const url = 'http://transport.orgp.spb.ru/Portal/transport/map/poi?ROUTE=' + id + '&REQUEST=GetFeature';
    request({
        url,
        headers: {
            'Referer': 'http://transport.orgp.spb.ru/Portal/transport/main',
        },
    }, (err, res, body) => {
        fs.writeFileSync('./route_data/' + id + '.json', JSON.stringify(JSON.parse(body), null, 4));
        getRouteLength(id);
        t();
    });
};

const getAllRoutes = (i) => {
    if (i >= IDS.length) {
        arr = (arr).slice(0, arr.length - 1) + '}';
        fs.writeFileSync('./lists/length_list.json', JSON.stringify(JSON.parse(arr), null, 4));

        const getSTOPS = require('./getStopList.js');
        getSTOPS;
        const startFORMAT = require('./format.js');
        startFORMAT;

        return;
    }
    const next = () => {
        setTimeout(() => getAllRoutes(i + 1), 1000);
    };
    console.log(i + 1 + '/' + IDS.length + ' routes collected');
    getRoute(IDS[i], next);
}

module.exports = getAllRoutes(0);
