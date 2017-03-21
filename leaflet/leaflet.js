const map = L.map('map');
map.setView([60, 30], 10.3);
map.addLayer(
    new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
);

route = '306'

fetch('../data.json')
    .then(r => r.json())
    .then(data => {

        Object.values(data.stops).forEach(s => {
            L.circleMarker([s.lat, s.lon], {
                stroke: false,
                color: 'navy',
                fillOpacity: 0.8,
                radius: 5,
            }).addTo(map);
        });
        Object.values(data.routes).forEach(r => {
            var color
            if (r.type === 'bus') {
                color = '#4C82F4'
            } else if (r.type === 'tram') {
                color = 'red'
            } else {
                color = '#67ED00'
            }
            Object.values(r.trips).forEach(t => {
                L.polyline(t.shape, {
                    color: color,
                    weight: 3,
                }).addTo(map);
            });
        });

        Object.values(data.routes[route].trips).forEach(t => {
            L.polyline(t.shape, {
                color: 'yellow',
                weight: 3,
            }).addTo(map);
        });

});
