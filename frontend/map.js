function timeToMinutes(t) {
    let parts = t.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function minutesToRadians(minute) {
    return (minute / 1440) * 2 * Math.PI - Math.PI/2;
}

function minutesToTime(min){
    let h = Math.floor(min / 60);
    let m = Math.floor(min % 60);
    return h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0");
}

function drawSleepCircle(startTime, endTime) {
    const canvas = document.getElementById("sleepCircle");
    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2 - 10;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#001d3d";
    ctx.fill();
    

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY - radius + 10);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(centerX, centerY + radius);
    ctx.lineTo(centerX, centerY + radius - 10);
    ctx.stroke();
    function timeToAngle(t) {
        const mins = timeToMinutes(t);
        return (mins / 1440) * 2 * Math.PI - Math.PI / 2; 
    }

    const startAngle = timeToAngle(startTime);
    const endAngle = timeToAngle(endTime);

    ctx.beginPath();
    ctx.strokeStyle = "#4d79ff";
    ctx.lineWidth = 20;
    if (endAngle > startAngle) {
        ctx.arc(centerX, centerY, radius - 10, startAngle, endAngle);
    } else {
        ctx.arc(centerX, centerY, radius - 10, startAngle, 3/2 * Math.PI);
        ctx.arc(centerX, centerY, radius - 10, -Math.PI/2, endAngle);
    }
    ctx.stroke();
}

function setSleepLabels(startMin, endMin) {
    const radius = 100; 
    const centerX = radius;
    const centerY = radius;

    const startLabel = document.getElementById("sleepStartLabel");
    const endLabel = document.getElementById("sleepEndLabel");

    const startAngle = minutesToRadians(startMin);
    const endAngle = minutesToRadians(endMin);

    startLabel.style.left = (centerX + radius * Math.cos(startAngle) - 10) + "px";
    startLabel.style.top  = (centerY + radius * Math.sin(startAngle) - 10) + "px";
    startLabel.innerText = `${Math.floor(startMin/60).toString().padStart(2,'0')}:${(startMin%60).toString().padStart(2,'0')}`;

    endLabel.style.left = (centerX + radius * Math.cos(endAngle) - 10) + "px";
    endLabel.style.top  = (centerY + radius * Math.sin(endAngle) - 10) + "px";
    endLabel.innerText = `${Math.floor(endMin/60).toString().padStart(2,'0')}:${(endMin%60).toString().padStart(2,'0')}`;
}



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
    
        let sunriseMin = timeToMinutes(data.sunrise);
        let sunsetMin = timeToMinutes(data.sunset);

        let daylight = (sunsetMin - sunriseMin + 1440) % 1440;
        let widthPercent = ((daylight) / 1440) * 100;
        let startPercent = (sunriseMin / 1440) * 100;

        let bar = document.getElementById("sunlight");

        let sunriseLabel = document.getElementById("sunriseLabel");
        let sunsetLabel = document.getElementById("sunsetLabel");

        sunriseLabel.innerText = data.sunrise;
        sunsetLabel.innerText = data.sunset;

        sunriseLabel.style.left = startPercent + "%";
        sunsetLabel.style.left = (startPercent + widthPercent) + "%";

        bar.style.width = widthPercent + "%";
        bar.style.left = startPercent + "%";
        marker.bindPopup(
            "🌅 Sunrise: " + data.sunrise + "<br>" + "🌇Sunset: " + data.sunset
        ).openPopup();

        //SleepCircle
        let nightLenght = (1440 - (sunsetMin - sunriseMin)) % 1440;

        let midNight = (sunsetMin + nightLenght/2) % 1440;

        let sleepStart = (midNight - 480 / 2 + 1440) % 1440;
        let sleepEnd   = (midNight + 480 / 2) % 1440;

        let sleepStartStr = minutesToTime(sleepStart);
        let sleepEndStr = minutesToTime(sleepEnd);

        drawSleepCircle(sleepStartStr, sleepEndStr);
        setSleepLabels(sleepStart, sleepEnd);
    });
});