from flask import Flask, request, jsonify
from flask_cors import CORS
from sun_calc import sunrise_sunset
from datetime import date
from datetime import datetime
from timezonefinder import TimezoneFinder
import pytz

app = Flask(__name__)

CORS(app)

@app.route("/sun", methods=["POST"])
def sun():

    data = request.json

    lat = data["lat"]
    lon = data["lon"]

    lon = ((lon + 180) % 360) - 180

    if lat > 90 or lat < -90:
        raise ValueError("Latitude out of bounds")

    tf = TimezoneFinder()
    tz_name = tf.timezone_at(lat = lat, lng = lon)

    if tz_name is None:
     tz_name = "UTC"

    tz = pytz.timezone(tz_name)
    offset = tz.utcoffset(datetime.now()).total_seconds() / 60

    sunrise, sunset = sunrise_sunset(lat, lon, date.today(), offset)

    return jsonify({
        "sunrise": sunrise,
        "sunset": sunset
    })

if __name__ == "__main__":
    app.run(debug=True) 