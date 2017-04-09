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
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        minZoom: 11,
        maxZoom: 19
    });

    var light = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        minZoom: 11,
        maxZoom: 19
    });

    var map = L.map('map', {
        center: [59.969881, 30.275338],
        zoom: 11,
        layers: [dark]
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
    Object.values(data.routes).forEach(r=>{
        var featureShape = []
          , featureStops = []
          , shape = [];
        Object.values(r.trips).forEach(t=>{
            t.shape.forEach(elem=>shape.push(elem))
            t.stops.forEach(s=>featureStops.push(L.circleMarker([data.stops[s].lat, data.stops[s].lon], colorScheme.dehighlightStop).bindPopup(`${data.stops[s].title}`).on('mouseover', (e)=>{
                e.target.setStyle(colorScheme.highlightStop)
            }
            ).on('mouseout', (e)=>{
                e.target.setStyle(colorScheme.dehighlightStop)
            }
            )))
        }
        )
        var clicked = false
        featureShape.push(L.polyline(shape, colorScheme.dehighlightRoute).bindPopup(`${r.id}`).on('mouseover', (e)=>{
            e.target.bringToFront()
            e.target.setStyle(colorScheme[r.type])
            if (clicked) {
                featureStops.bringToFront()
            }
        }
        ).on('mouseout', (e)=>{
            if (!clicked) {
                e.target.bringToBack()
                e.target.setStyle(colorScheme.dehighlightRoute)
            }
        }
        ).on('click', (e)=>{
            if (!clicked) {
                e.target.bringToFront()
                e.target.setStyle(colorScheme[r.type])
                clicked = true
                map.addLayer(featureStops)
            } else {
                e.target.bringToBack()
                e.target.setStyle(colorScheme.dehighlightRoute)
                clicked = false
                map.removeLayer(featureStops)
            }
        }
        ))
        routes[r.type].shape.push(featureShape)
        routes[r.type].stops.push(featureStops)
        featureStops = L.featureGroup(featureStops)
        featureShape = L.featureGroup(featureShape)
        map.on('overlayremove', ()=>{
            map.removeLayer(featureStops)
            clicked = false
            featureShape.setStyle(colorScheme.dehighlightRoute);
        }
        );
        map.on('overlayadd', ()=>{
            if (clicked) {
                featureShape.bringToFront();
                featureStops.bringToFront();
            }
        }
        )

    }
    )

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

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    map.addLayer(busRoads)
    map.addLayer(tramRoads)
    map.addLayer(trolleyRoads)

}
);
