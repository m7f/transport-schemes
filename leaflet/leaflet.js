const colorScheme = {
    bus: {
        color: '#0779D0',
        weight: 7
    },
    tram: {
        color: '#FF0000',
        weight: 7
    },
    trolley: {
        color: '#00B41F',
        weight: 7
    },
    dehighlightRoute: {
        color: '#87939F',
        weight: 3,
    },
    highlightStop: {
        stroke: true,
        radius: 11,
        fillColor: "#FFFFFF",
        weight: 3,
        opacity: 1,
        fillOpacity: 1
    },
    dehighlightStop: {
        radius: 8,
        fillColor: "#FFFFFF",
        weight: 6,
        opacity: 1,
        fillOpacity: 1
    },
    cluster: {
        stroke: false,
        radius: 20,
        color: "#e300ff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.2
    }
}

var routes = {
    bus: {
        shape: [],
        stops: []
    },
    tram: {
        shape: [],
        stops: []
    },
    trolley: {
        shape: [],
        stops: []
    }
}


const calculateViewportCenter = (stops) => {
    const lat = stops.map(s => s.lat);
    const lon = stops.map(s => s.lon);
    const ll = [
        lat.reduce((a, v) => Math.min(a, v), Infinity),
        lon.reduce((a, v) => Math.min(a, v), Infinity),
    ];
    const ur = [
        lat.reduce((a, v) => Math.max(a, v), -Infinity),
        lon.reduce((a, v) => Math.max(a, v), -Infinity),
    ];
        return [ (ll[0] + ur[0]) / 2, (ll[1] + ur[1]) / 2 ];
    };

var featureClusters = []


var currentRoute = 'none'

drawScheme = (data, map, options = {}) => {
    var clicks = {}
    var highlightedRoute = 'none';
    var highlightedStops = 'none';
    var highlightedShape = 'none';
    Object.keys(data.routes).forEach(r=>{
        var icon = '';
        const key = r
        r = data.routes[r]
        if (r.type === 'bus') {
            icon = '&#x1F68C';
        } else if (r.type === 'trolley') {
            icon = '&#x1F68E';
        } else if (r.type === 'tram') {
            icon = '&#x1F68B';
        }
        var textRoute = `<div class="roadLine" id="myLine" style='height: 100%'></div><li><div id='myStop'><font size = 20>${icon} ${r.id}</font></div></li>`;
        var featureShape = [], featureStops = [], shape = [];



        Object.values(r.trips).forEach(t=>{
            t.shape.forEach(elem=>shape.push(elem))
            t.stops.forEach(s=> {

                textRoute += `<div class="roadLine" id="myLine"></div><div class="stopDot">&#9899;</div>`
                +`<li onclick="fun([${data.stops[s].lat}, ${data.stops[s].lon}])"> ${data.stops[s].title}</li>`

                featureStops.push(L.circleMarker([data.stops[s].lat, data.stops[s].lon], colorScheme.dehighlightStop)
                .setStyle({color: colorScheme[r.type].color})
                .bindPopup(`${data.stops[s].title}`)
                .on('mouseover', (e)=>{
                    e.target.setStyle(colorScheme.highlightStop)
                })
                .on('mouseout', (e)=>{
                    e.target.setStyle(colorScheme.dehighlightStop)
                }))

            }
        )})



        clicks[shape] = false;
        featureShape.push(L.polyline(shape, colorScheme.dehighlightRoute)
        .on('mouseover', (e) => {
            if (!clicks[shape]) {
                e.target.bringToFront()
                e.target.setStyle(colorScheme[r.type])
            }
        })
        .on('mouseout', (e) => {
            if (!clicks[shape]) {
                e.target.bringToBack()
                e.target.setStyle(colorScheme.dehighlightRoute)
            }
        })
        .on('click', (e) => {
            clicks[shape] = !clicks[shape]
            if (!clicks[shape]) {
                highlightedRoute = 'none';
                highlightedStops = 'none';
                highlightedShape = 'none';
                e.target.bringToBack()
                e.target.setStyle(colorScheme.dehighlightRoute)
                map.removeLayer(featureStops)
                map.removeLayer(featureClusters)
                featureClusters = clusterisation(data, map, r, options.D)
                document.getElementById("mySidenav").innerText = "";
                closeNav();
            } else {
                if (highlightedRoute != 'none') {
                    highlightedRoute.target.bringToBack()
                    highlightedRoute.target.setStyle(colorScheme.dehighlightRoute)
                    map.removeLayer(highlightedStops)
                    clicks[highlightedShape] = false
                }
                highlightedRoute = e;
                highlightedStops = featureStops;
                highlightedShape = shape;
                e.target.bringToFront()
                e.target.setStyle(colorScheme[r.type])


                map.addLayer(featureStops)


                map.removeLayer(featureClusters)
                featureClusters = clusterisation(data, map, r, options.D)
                map.addLayer(featureClusters)
                document.getElementById('cluster-radius').value = document.getElementById('cluster-radius').min


                currentRoute = key

                featureStops.bringToFront()
                featureClusters.bringToBack()
                document.getElementById("mySidenav").innerHTML = textRoute;



                openNav();



            }}))
        routes[r.type].shape.push(featureShape)
        routes[r.type].stops.push(featureStops)
        featureStops = L.featureGroup(featureStops)
        featureShape = L.featureGroup(featureShape)

    })
}



clusterisation = (data, map, route, size) => {

    const mean = arr => arr.reduce((a, val) => a + val, 0) / arr.length;

    const d = (s1, s2) => {  // generally used geo measurement function
        var R = 6378.137; // Radius of earth in KM
        var dLat = s2.lat * Math.PI / 180 - s1.lat * Math.PI / 180;
        var dLon = s2.lon * Math.PI / 180 - s1.lon * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(s1.lat * Math.PI / 180) * Math.cos(s2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d * 1000; // meters
    }

    const centroid = clust => ({
        lat: mean(clust.map(stop => stop.lat)),
        lon: mean(clust.map(stop => stop.lon)),
    });

    const computeMaxDist = (clust) => {
        maxDist = centroid(clust.stops)
        clust.stops.forEach(stop => {
            if (d(maxDist, centroid(clust.stops)) < d(stop, centroid(clust.stops))) {
                maxDist = stop
            }
        })
        return maxDist
    }

    const computeClusters = (stops, D) => {

        var clusters = [];
        stops.forEach(stop => {
            const nearClust = clusters.find(clust =>
                d(stop, centroid(clust.stops)) < d(centroid(clust.stops), computeMaxDist(clust)) + D
            );
            if (nearClust) {
                nearClust.stops.push(stop);

            } else {
                clusters.push({ stops: [stop] });
            }
        });

        clusters = clusters.map(cluster => L.circle([centroid(cluster.stops).lat, centroid(cluster.stops).lon], {
            stroke: false,
            radius: d(centroid(cluster.stops), computeMaxDist(cluster)) + D,
            color: "#e300ff",
            fillOpacity: 0.2
        })
        )
        return clusters;
    }

    var clusters = [], shape = [], stops = []
    Object.values(route.trips).forEach(t=>{
        t.shape.forEach(elem=>shape.push(elem))
        t.stops.forEach(s=>{
            stops.push({lat: data.stops[s].lat, lon: data.stops[s].lon})
        })
    })

    clusters = computeClusters(stops, size)
    return L.featureGroup(clusters)
}


drawClusters = (data, map, route, options = {}) => {
    if (currentRoute != 'none') {
        map.removeLayer(featureClusters)
        featureClusters = clusterisation(data, map, data.routes[currentRoute], options.D)
        map.addLayer(featureClusters)
        featureClusters.bringToBack()
    }

}


startApp = (data) => {

var dark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    minZoom: 11,
    maxZoom: 19
});

var light = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    minZoom: 11,
    maxZoom: 19
});

var map = L.map('map', {
    center: calculateViewportCenter(Object.values(data.stops)),
    zoom: 11,
    layers: [light],
    zoomControl: false
});


drawScheme(data, map, {D: 0.01});



var busRoads = [], tramRoads = [], trolleyRoads = [];

routes.bus.shape.forEach(f=>{
    f.forEach(e=>busRoads.push(e))}
)
routes.tram.shape.forEach(f=>{
    f.forEach(e=>tramRoads.push(e))}
)
routes.trolley.shape.forEach(f=>{
    f.forEach(e=>trolleyRoads.push(e))
}
)
busRoads = L.featureGroup(busRoads)
tramRoads = L.featureGroup(tramRoads)
trolleyRoads = L.featureGroup(trolleyRoads)

var baseMaps = {
    "Светлая тема": light,
    "Темная тема": dark
};

var overlayMaps = {
    "Автобусы": busRoads,
    "Трамваи": tramRoads,
    "Троллейбусы": trolleyRoads
};

//L.control.layers(baseMaps, overlayMaps).addTo(map);

L.control.zoom({position:'topright'}).addTo(map);
map.addLayer(busRoads)
map.addLayer(tramRoads)
map.addLayer(trolleyRoads)


fun = (latlng) => map.setView(latlng, 15, {"animate": true,"pan": {"duration": 0.5}});

const clusterControl = document.getElementById('cluster-radius');
    clusterControl.addEventListener('input', () => {
        const clusterSize = Number(clusterControl.value);

        drawClusters(data, map, currentRoute, {D: clusterSize});

    })

}



openNav = () => {
    //document.getElementById("button0").innerText = "\u2636"
    document.getElementById("mySidenav").style.left = "0px";
    document.getElementById("button0").style.marginLeft = "350px";
}

closeNav = () => {
    //document.getElementById("button0").innerText = "\u2630"
    document.getElementById("mySidenav").style.left = "-350px";
    document.getElementById("button0").style.marginLeft = "0px";
}

changeNav = () => {
    if (document.getElementById("mySidenav").style.left != "0px"){
        openNav();
    } else {
        closeNav();
    }
}









fetch('../data.json').then(r=>r.json()).then(data=>startApp(data));
