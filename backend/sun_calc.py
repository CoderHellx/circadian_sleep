import math
from datetime import date, datetime

def day_of_year(d):
    return d.timetuple().tm_yday

def minutes_to_time(minutes):
    
    minutes = minutes % 1440 
    
    hours = int(minutes // 60)
    mins = int(minutes % 60)

    return f"{hours:02d}:{mins:02d}"

def sunrise_sunset(lat, lon, d, timezone_offset):

    n = day_of_year(d)

    gamma = ((2 * math.pi) / 365) * (n - 1) # gamm = fractional year
    
    delta = 0.006918 - 0.399912*math.cos(gamma) + 0.070257*math.sin(gamma) - 0.006758*math.cos(2*gamma) + 0.000907*math.sin(2*gamma)-0.002697*math.cos(3*gamma)+0.00148*math.sin(3*gamma) #delta = solar declination

    phi = math.radians(lat) #phi = latitude in radians
    
    cosH = (math.sin(math.radians(-0.833)) - math.sin(phi)*math.sin(delta)) / (math.cos(phi)*math.cos(delta))
    cosH = max(-1, min(1,cosH))
    hour_angle = math.acos(cosH)

    e = 229.18 * ((0.000075 + 0.001868*math.cos(gamma) - 0.032077 * math.sin(gamma) - 0.014615 * math.cos(2 * gamma) - 0.040849 * math.sin(2 * gamma))) #e = Equation of Time
    
    
    solar_noon = 720 - 4*lon - e + timezone_offset

    hour_angle_minutes = ((hour_angle * 180)/(math.pi)) * 4

    sunset = solar_noon + hour_angle_minutes
    sunrise = solar_noon - hour_angle_minutes

    return minutes_to_time(sunrise), minutes_to_time(sunset)

