fetch('../data.json').then(r=>r.json()).then(data=>{

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
        }
    }

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
        center: [59.969881, 30.275338],
        zoom: 11,
        layers: [light],
        zoomControl: false
    });

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
    var highlightedRoute = 'none';
    var highlightedStops = 'none';
    var highlightedShape = 'none';
    var clicks = {};
    Object.values(data.routes).forEach(r=>{
        var icon = '';
        if (r.type === 'bus') {
            icon = '&#x1F68C';
        } else if (r.type === 'trolley') {
            icon = '&#x1F68E';
        } else if (r.type === 'tram') {
            icon = '&#x1F68B';
        }
        var textRoute = `<div class="roadLine" id="myLine" style='height: 100%'></div><li><div id='myStop'><font size = 20>${icon} ${r.id}</font></div></li>`;
        var featureShape = []
          , featureStops = []
          , shape = [];
        Object.values(r.trips).forEach(t=>{

            t.shape.forEach(elem=>shape.push(elem))
            t.stops.forEach(s=> {
                textRoute += `<div class="roadLine" id="myLine"></div><div class="stopDot">&#9899;</div><li onclick="fun([${data.stops[s].lat}, ${data.stops[s].lon}])"> ${data.stops[s].title}</li>`
                    featureStops.push(L.circleMarker([data.stops[s].lat, data.stops[s].lon], colorScheme.dehighlightStop)
                .setStyle({color: colorScheme[r.type].color})
                .bindPopup(`${data.stops[s].title}`)
                .on('mouseover', (e)=>{
                    e.target.setStyle(colorScheme.highlightStop)
                })
                .on('mouseout', (e)=>{
                    e.target.setStyle(colorScheme.dehighlightStop)
                }
                ))}
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
                featureStops.bringToFront()
                document.getElementById("mySidenav").innerHTML = textRoute;
                openNav();


            }}))
        routes[r.type].shape.push(featureShape)
        routes[r.type].stops.push(featureStops)
        featureStops = L.featureGroup(featureStops)
        featureShape = L.featureGroup(featureShape)
    })

    var busRoads = []
      , tramRoads = []
      , trolleyRoads = [];
    routes.bus.shape.forEach(f=>{
        f.forEach(e=>busRoads.push(e))
    }
    )
    routes.tram.shape.forEach(f=>{
        f.forEach(e=>tramRoads.push(e))
    }
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



});

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
