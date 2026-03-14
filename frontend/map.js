var map = L.map('map').setView([20,0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

let marker;

map.on('click', function(e) {

    let lat = e.latlng.lat;
    let lon = e.latlng.lng;

    lon = ((lon + 180) % 360) - 180;

    console.log("Latitude:", lat);
    console.log("Longitude:", lon);

    if(marker){
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lon]).addTo(map);

    document.getElementById("coords").innerText = "Latitude: " + lat.toFixed(4) + "| Longitude: " + lon.toFixed(4);

    fetch("http://127.0.0.1:5000/sun", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        lat: lat,
        lon: lon
    })

    })
    .then(response => response.json())
    .then(data => {

        document.getElementById("sunrise").innerText =
            "Sunrise: " + data.sunrise;

        document.getElementById("sunset").innerText =
            "Sunset: " + data.sunset;

    });
});