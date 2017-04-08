fetch('../data.json')
.then(r => r.json())
.then(data => {

    const colorScheme = {
        bus: {
            color: '#5EC7FF',
            weight: 6
        },
        tram: {
            color: '#F90303',
            weight: 6
        },
        trolley: {
            color: '#67ED00',
            weight: 6
        },
        dehighlightRoute : {
            color: '#015ADD',
            weight: 3,
        },
        highlightStop : {
            color: 'red',
            radius: 6,
        },
        dehighlightStop : {
            stroke: false,
            color: 'navy',
            fillOpacity: 0.8,
            radius: 4,
        }
    }

    var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox.light',
        attribution: mbAttr}),
        common   = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    var map = L.map('map', {
        center: [60, 30],
        zoom: 10,
        layers: [grayscale]
    });



    onStopOver = (e) => {
        e.target.setStyle(colorScheme.highlightStop)
    }

    onStopOut = (e) => {
        e.target.setStyle(colorScheme.dehighlightStop)
    }


    var stops = L.layerGroup(Object.values(data.stops).filter(value => value.status === 'active').map(s =>
        L.circleMarker([s.lat, s.lon], colorScheme.dehighlightStop)
            .bindPopup(`${s.title}<br>${s.lat}, ${s.lon}`)
            .on('mouseover', onStopOver)
            .on('mouseout', onStopOut)

    ));



    var lines = [];
    Object.values(data.routes).forEach(r => {
        Object.values(r.trips).forEach(t => {
            var clicked = 'false'
            lines.push(L.polyline(t.shape, colorScheme.dehighlightRoute)
            .bindPopup(`${r.id}`)
            .on('mouseover', (e) => {
                e.target.bringToFront();
                e.target.setStyle(colorScheme[r.type])
            })
            .on('mouseout', (e) => {
                if (clicked === 'false') {
                    e.target.bringToBack();
                    e.target.setStyle(colorScheme.dehighlightRoute)
                }
            })
            .on('click', (e) => {
                if (clicked === 'false') {
                    clicked = 'true'
                    e.target.bringToFront();
                    e.target.setStyle(colorScheme[r.type])
                } else {
                    e.target.bringToBack();
                    e.target.setStyle(colorScheme.dehighlightRoute)
                }
            })
        )});
    });

    var roads = L.featureGroup(lines);

    var baseMaps = {
        "Grayscale": grayscale,
        "Common": common
    };

    var overlayMaps = {
        "Stops": stops,

    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    map.addLayer(roads)

});
