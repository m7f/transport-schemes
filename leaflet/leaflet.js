fetch('../data.json').then(r=>r.json()).then(data=>{

    const colorScheme = {
        bus: {
            color: '#5EC7FF',
            weight: 6
        },
        tram: {
            color: '#FF0000',
            weight: 6
        },
        trolley: {
            color: '#67ED00',
            weight: 6
        },
        dehighlightRoute: {
            color: '#1441C9',
            weight: 3,
        },
        highlightStop: {
            radius: 8,
            fillColor: "#FF7800",
            color: "#000000",
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        },
        dehighlightStop: {
            radius: 8,
            fillColor: "#FF7800",
            color: "#000000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
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
        layers: [dark],
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
        var featureShape = []
          , featureStops = []
          , shape = [];
        Object.values(r.trips).forEach(t=>{
            t.shape.forEach(elem=>shape.push(elem))
            t.stops.forEach(s=>featureStops.push(L.circleMarker([data.stops[s].lat, data.stops[s].lon], colorScheme.dehighlightStop)
            .bindPopup(`${data.stops[s].title}`)
            .on('mouseover', (e)=>{
                e.target.setStyle(colorScheme.highlightStop)
            })
            .on('mouseout', (e)=>{
                e.target.setStyle(colorScheme.dehighlightStop)
            }
            ))
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

});

openNav = () => {
    document.getElementById("button0").innerText = "<"
    document.getElementById("mySidenav").style.width = "350px";
    document.getElementById("button0").style.marginLeft = "350px";
}

closeNav = () => {
    document.getElementById("button0").innerText = ">"
    document.getElementById("mySidenav").style.width = "0px";
    document.getElementById("button0").style.marginLeft = "0px";
}

changeNav = () => {
    if (document.getElementById("mySidenav").style.width != "350px"){
        openNav();
    } else {
        closeNav();
    }
}
