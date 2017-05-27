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
    unselectedStop: {
        color: '#87939F'
    },
    cluster: {
        color: "#b808bb"
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

clusterisation = (data, map, stops, size, type) => {

    stops = stops.map(s => Object({id: s, lat: data.stops[s].lat, lon: data.stops[s].lon}))

    const mean = arr => arr.reduce((a, val) => a + val, 0) / arr.length;

    const d = (s1, s2) => {
        var R = 6378.137
        var dLat = s2.lat * Math.PI / 180 - s1.lat * Math.PI / 180
        var dLon = s2.lon * Math.PI / 180 - s1.lon * Math.PI / 180
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(s1.lat * Math.PI / 180) * Math.cos(s2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        var d = R * c
        return d * 1000
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

    var merged = false

    const checkCluster = (clust, clusters, D) => {
        const radius =  d(centroid(clusters[clust].stops), computeMaxDist(clusters[clust])) + D

        const nearClust = (c) => {
            const innerStop = (stop) => {
                return c != clust && d(stop, centroid(clusters[clust].stops)) < radius
            }
            return clusters[c].stops.some(innerStop)
        }

        if (Object.keys(clusters).some(nearClust)) {
            merge = Object.keys(clusters).find(c => nearClust(c))
            clusters[clust].stops = clusters[clust].stops.concat(clusters[merge].stops)
            clusters.splice(merge, 1)
            merged = true
        } else {
            merged = false
        }
        return clusters
    }

    const checkAll = (clusters, D) => {
        var id = 0, maxid = clusters.length
        while (id != maxid) {
            clusters = checkCluster(id, clusters, D)
            if (merged) {
                --maxid
                id = 0
            } else {
                ++id
            }
        }
    }

    const computeClusters = (stops, D) => {

        var clusters = stops.map(stop => Object({stops:[stop]}));

        checkAll(clusters, D)

        onMap.currentClusterCentres = clusters.map(cluster => {
            ids = []
            cluster.stops.forEach(stop => {
                ids.push(stop.id)
            })
            return Object({ids: ids, lat: centroid(cluster.stops).lat, lon: centroid(cluster.stops).lon})
        })

        clusters = clusters.map(cluster => {
            size = 0
            cluster.stops.forEach(stop => {
                ++size
            })
            return L.circle([centroid(cluster.stops).lat, centroid(cluster.stops).lon], {
                stroke: false,
                radius: d(centroid(cluster.stops), computeMaxDist(cluster)) + D,
                color: "#e300ff",
                fillOpacity: 0.2
                }
        ).bindPopup(size + ' stops')}
        )
        return clusters;
    }

    const computeLightClusters = (stops, D) => {
        var clusters = [];
        stops.forEach(stop1 => {
            const nearClust = clusters.find(clust =>
                clust.stops.some(stop2 => d(stop1, stop2) < D)
            );
            if (nearClust) {
                nearClust.stops.push(stop1);
            } else {
                clusters.push({ stops: [stop1] });
            }
        });
        onMap.currentClusterCentres = clusters.map(cluster => {
            ids = []
            cluster.stops.forEach(stop => {
                ids.push(stop.id)
            })
            return Object({ids: ids, lat: centroid(cluster.stops).lat, lon: centroid(cluster.stops).lon})
        })

        clusters = clusters.map(cluster => {
            size = 0
            cluster.stops.forEach(stop => {
                ++size
            })
            return L.circle([centroid(cluster.stops).lat, centroid(cluster.stops).lon], {
                stroke: false,
                radius: Number(cluster.stops.length) * D / 70,
                color: "#e300ff",
                fillOpacity: 0.2
                }
        ).bindPopup(size + ' stops')}
        )
        return clusters;
    }

    if (type === 'hard') {
        return L.featureGroup(computeClusters(stops, size))
    } else {
        return L.featureGroup(computeLightClusters(stops, size))
    }
}


var currentNav = 'mySidenav'

const getStopsFeature = (data, map, stops, style) => {
    var featureStops = [];
    stops.forEach(s => {
        featureStops.push(L.circleMarker([data.stops[s].lat, data.stops[s].lon], colorScheme.dehighlightStop)
        .setStyle(style)
        .on('mouseover', (e)=>{
            e.target.setStyle(colorScheme.highlightStop)
        })
        .on('mouseout', (e)=>{
            e.target.setStyle(colorScheme.dehighlightStop)
        })
        .on('click', (e)=>{
            aim = (latlng) => {
                map.setView(latlng, 15, {"animate": true,"pan": {"duration": 0.5}});
            }
            var textRoute = `<li style="background-color: #e6e6e6;" onclick="aim([${data.stops[s].lat}, ${data.stops[s].lon}])"> ${data.stops[s].title}</li>`
            stopsToRoutes[s].forEach(r => {
                textRoute += `<li onclick="">${data.routes[r].id}</li>`
            })
            document.getElementById("mySidenav").innerHTML = textRoute;
            e.target.setStyle({color: 'rgb(1, 255, 164)'})
            map.removeLayer(onMap.featureRoutes)
            map.removeLayer(onMap.featureStops)
            onMap.currentRoutes = stopsToRoutes[s]
            onMap.featureRoutes = getRoutesFeature(data, map, onMap.currentRoutes)
            onMap.currentStops = []
            onMap.currentRoutes.forEach(r => {
                Object.values(data.routes[r].trips).forEach(t => {
                    onMap.currentStops = onMap.currentStops.concat(t.stops)
                })
            })
            onMap.featureStops = getStopsFeature(data, map, onMap.currentStops, colorScheme['unselectedStop'])
            map.addLayer(onMap.featureRoutes)
            map.addLayer(onMap.featureStops)
        })
    )
    })
    return L.featureGroup(featureStops)
}


const highlightRoutes = (data, map, routes) => {
    routes.forEach(r => {

    })
}

const getRoutesFeature = (data, map, routes) => {

    clicks = {}
    var highlightedRoute = 'none';
    var highlightedStops = 'none';
    var highlightedId = 'none';
    var featureRoutes = []

    routes.forEach(r => {

        var shape = [];
        Object.values(data.routes[r].trips).forEach(t=>{
            t.shape.forEach(elem=>shape.push(elem))
        })
        clicks[r] = false;


        featureRoutes.push(L.polyline(shape, colorScheme.dehighlightRoute)
        .on('mouseover', (e) => {
            if (!clicks[r]) {
                e.target.bringToFront()
                e.target.setStyle(colorScheme[data.routes[r].type])
            }
        })
        .on('mouseout', (e) => {
            if (!clicks[r]) {
                e.target.bringToBack()
                e.target.setStyle(colorScheme.dehighlightRoute)
            }
            try {onMap.featureClusters.bringToBack()} catch(err) {}
        })
        .on('click', (e) => {
            clicks[r] = !clicks[r]

            var icon = '';
            if (data.routes[r].type === 'bus') {
                icon = '&#x1F68C';
            } else if (data.routes[r].type === 'trolley') {
                icon = '&#x1F68E';
            } else if (data.routes[r].type === 'tram') {
                icon = '&#x1F68B';
            }
            aim = (latlng) => {
                map.setView(latlng, 15, {"animate": true,"pan": {"duration": 0.5}});
            }
            var stops = []
            var textRoute = `<li style="background-color: #e6e6e6;"><div id='myStop'><font size = 20>${icon} ${data.routes[r].id}</font></div></li>`;
            var begin = true;
            Object.values(data.routes[r].trips).forEach(t=>{
                t.stops.forEach(s => {
                    stops.push(s)
                    if (begin) textRoute += `<div class="roadLine" id="myLine" style='height: 100%'></div>`
                    begin = false
                    textRoute += `<div class="roadLine" id="myLine"></div><div class="stopDot">&#9899;</div>`
                    +`<li onclick="aim([${data.stops[s].lat}, ${data.stops[s].lon}])"> ${data.stops[s].title}</li>`
                })
            })

            if (!clicks[r]) {
                highlightedRoute = 'none';
                highlightedStops = 'none';
                highlightedId = 'none';
                map.removeLayer(onMap.featureStops)
                map.removeLayer(onMap.featureClusters)
                e.target.bringToBack()
                e.target.setStyle(colorScheme.dehighlightRoute)
                document.getElementById("mySidenav").innerHTML = "";
                closeNav(currentNav);
            } else {
                clicks[highlightedId] = !clicks[highlightedId]
                highlightedId = r
                if (highlightedRoute != 'none') {
                    highlightedRoute.target.bringToBack()
                    highlightedRoute.target.setStyle(colorScheme.dehighlightRoute)
                    map.removeLayer(highlightedStops)

                }
                highlightedRoute = e;
                map.removeLayer(onMap.featureStops)
                map.removeLayer(onMap.featureClusters)
                onMap.currentStops = stops
                onMap.featureStops = getStopsFeature(data, map, stops, colorScheme[data.routes[r].type])
                highlightedStops = onMap.featureStops;
                map.addLayer(onMap.featureStops)
                e.target.bringToFront()
                onMap.featureStops.bringToFront()
                e.target.setStyle(colorScheme[data.routes[r].type])
                document.getElementById("mySidenav").innerHTML = textRoute;
                openNav(currentNav);

            }const clusterButton = document.getElementById('cluster-button');
        })

    )})
    return L.featureGroup(featureRoutes)
}

const getStopsCentres = (data, map, stopsLatLon, style) => {
    var featureStops = [];
    stopsLatLon.forEach(s => {
        return featureStops.push(L.circleMarker([s.lat, s.lon], colorScheme.dehighlightStop)
        .setStyle(style)
        .on('mouseover', (e)=>{
            e.target.setStyle(colorScheme.highlightStop)
        })
        .on('mouseout', (e)=>{
            e.target.setStyle(colorScheme.dehighlightStop)
        })
        .on('click', (e) => {
            var text = ''
            s.ids.forEach(id => text += `<li>${data.stops[id].title}</li>`)
            document.getElementById("mySidenav").innerHTML = text
        })
    )
    })
    return L.featureGroup(featureStops)
}


var onMap = {
    currentStops: [],
    currentRoutes: [],
    currentClusterCentres: [],
    featureStops: {},
    featureRoutes: {},
    featureClusters: {},
}


var graph = {}
const computeGraph = (data) => {
    Object.values(data.routes).forEach(r => {
        Object.values(r.trips).forEach(t => {
            var i = 0
            if (t.stops.length != 0 && t.stops.length != 1)
            while (i != t.stops.length - 1) {
                if (!graph[t.stops[i]]) graph[t.stops[i]] = []
                if (!graph[t.stops[i + 1]]) graph[t.stops[i + 1]] = []
                if (graph[t.stops[i]].indexOf(graph[t.stops[i + 1]]) < 0) graph[t.stops[i]].push(t.stops[i + 1])
                if (graph[t.stops[i + 1]].indexOf(graph[t.stops[i]]) < 0) graph[t.stops[i + 1]].push(t.stops[i])
                i += 1
            }
        })
    })
}

var stopsToRoutes = {}
const computeStopsToRoutes = (data) => {
    Object.keys(data.routes).forEach(r => {
        Object.values(data.routes[r].trips).forEach(t => {
            var i = 0
            if (t.stops.length != 0)
            while (i != t.stops.length) {
                if (!stopsToRoutes[t.stops[i]]) stopsToRoutes[t.stops[i]] = []
                stopsToRoutes[t.stops[i]].push(r)
                i += 1
            }
        })
    })
}

const getClusterType = () => {
    if (document.getElementById('cluster-type-r1').checked) {
        return document.getElementById('cluster-type-r1').value
    } else if (document.getElementById('cluster-type-r2').checked) {
        return document.getElementById('cluster-type-r2').value
    } else {
        return document.getElementById('cluster-type-r3').value
    }
}
``

const start = data => {

    document.getElementById("button1").style.top = "50px";

    computeGraph(data)
    computeStopsToRoutes(data)

    var map = L.map('map', {
        center: calculateViewportCenter(Object.values(data.stops)),
        zoom: 11,
        zoomControl: false,
        layers: [
            L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                subdomains: 'abcd',
                minZoom: 11,
                maxZoom: 19
            })
        ],
    });


    const clusterControl = document.getElementById('cluster-radius');

    const clusterButton = document.getElementById('cluster-button');

    const renderButton = document.getElementById('render-button');

    var clusterType = getClusterType()
    var renderType = [document.getElementById('render-type-c1'),
    document.getElementById('render-type-c2')];


    const render = (renderType) => {
        map.removeLayer(onMap.featureRoutes)
        map.removeLayer(onMap.featureStops)
        map.removeLayer(onMap.featureClusters)
        clusterControl.value = 0
        document.getElementById('cluster-radius-value').innerHTML = '0 meters'
        document.getElementById('cluster-type-r1').checked = true
        if (renderType[1].checked) {
            onMap.currentRoutes = Object.keys(data.routes)
            onMap.featureRoutes = getRoutesFeature(data, map, onMap.currentRoutes)
            map.addLayer(onMap.featureRoutes)
        }
        if (renderType[0].checked) {
            onMap.currentStops = Object.keys(data.stops).filter(stop => (data.stops[stop].status === 'active'))
            onMap.featureStops = getStopsFeature(data, map, onMap.currentStops, colorScheme.unselectedStop)
            map.addLayer(onMap.featureStops)
        }
    }

    render(renderType)

    renderButton.addEventListener('click', () => {
        render(renderType)
    })

    clusterButton.addEventListener('click', () => {
        clusterType = getClusterType()
        if (clusterType === 'off') {
            clusterControl.value = 0
            document.getElementById('cluster-radius-value').innerHTML = '0 meters'
            map.removeLayer(onMap.featureClusters)
            map.removeLayer(onMap.featureStops)
            onMap.featureStops = getStopsFeature(data, map, onMap.currentStops, colorScheme.unselectedStop)
            map.addLayer(onMap.featureStops)
        } else {
            map.removeLayer(onMap.featureClusters)
            onMap.featureClusters = clusterisation(data, map, onMap.currentStops, Number(clusterControl.value), clusterType)
            map.addLayer(onMap.featureClusters)

            onMap.featureClusters.bringToBack()

            map.removeLayer(onMap.featureStops)
            onMap.featureStops = getStopsCentres(data, map, onMap.currentClusterCentres, colorScheme.cluster)
            map.addLayer(onMap.featureStops)
        }
    })


}

sideNavs = ["mySidenav", "mySidenav1"]
buttons = ["button0", "button1"]

openNav = (id) => {
    currentNav = id
    sideNavs.forEach(panel => {
        if (panel === id) {
            document.getElementById(panel).style.left = "0px";
        } else {
            document.getElementById(panel).style.left = "-350px";
        }
    })
    buttons.forEach(btn => {
        document.getElementById(btn).style.marginLeft = "350px";
    })
}

closeNav = (id) => {
    sideNavs.forEach(panel => {
        document.getElementById(panel).style.left = "-350px";
    })
    buttons.forEach(btn => {
        document.getElementById(btn).style.marginLeft = "0px";
    })
}

changeNav = (id) => {
    if (document.getElementById(id).style.left != "0px"){
        openNav(id);
    } else {
        closeNav(id);
    }
}


fetch('../data.json').then(r=>r.json()).then(data=>start(data));



/* in development */

var graph = {
    vertex:[],
    edge:[]
}

const dijkstra = (start) => {
    var distance = {}, prev = {}, vertices = {}, u;

    graph.vertex.forEach(function(v_i) {
        distance[v_i] = Infinity;
        prev[v_i] = null;
        vertices[v_i] = true;
    });

    distance[start] = 0;

    while (Object.keys(vertices).length > 0) {
        u = Object.keys(vertices).reduce(function(prev, v_i) {
            return distance[prev] > distance[v_i] ? +v_i : prev;
        }, Object.keys(vertices)[0]);

        graph.edge.filter(function(edge) {
            var from = edge[0],
            to 	 = edge[1];
            return from===u || to===u;
        })
        .forEach(function(edge) {
            var to = edge[1]===u ? edge[0] : edge[1],
            dist = distance[u] + edge[2];

            if (distance[to] > dist) {
                distance[to] = dist;
                prev[to] = u;
            }
        });
        delete vertices[u];
    }
    return distance;
};
