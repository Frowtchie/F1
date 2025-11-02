#!/usr/bin/env python3
"""
Production-ready Real F1 Data API Server
Optimized for cloud deployment
"""

import fastf1
from fastf1 import plotting
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import pandas as pd
import numpy as np
from datetime import datetime
import logging

# Configure logging for production
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../static')
CORS(app)

# Configure FastF1
plotting.setup_mpl(backend='Agg')  # Use non-interactive backend for server

# Create cache directory
cache_dir = os.path.join(os.path.dirname(__file__), '..', 'cache')
os.makedirs(cache_dir, exist_ok=True)
fastf1.Cache.enable_cache(cache_dir)

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# Team colors for visualization
TEAM_COLORS = {
    'Red Bull Racing': '#0600EF',
    'Mercedes': '#00D2BE',
    'Ferrari': '#DC143C',
    'McLaren': '#FF8700',
    'Alpine': '#0077CC',
    'AlphaTauri': '#2B4562',
    'Aston Martin': '#006F62',
    'Williams': '#005AFF',
    'Alfa Romeo': '#900000',
    'Haas': '#FFFFFF'
}

@app.route('/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        "status": "healthy", 
        "fastf1_version": fastf1.__version__,
        "message": "F1 Data API is running"
    })

@app.route('/api/years')
def get_available_years():
    """Get available F1 seasons"""
    try:
        # Available years in FastF1
        years = [2020, 2021, 2022, 2023, 2024]
        return jsonify(years)
    except Exception as e:
        logger.error(f"Error getting years: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/races/<int:year>')
def get_race_schedule(year):
    """Get race schedule for a specific year"""
    try:
        schedule = fastf1.get_event_schedule(year)
        
        races = []
        for _, race in schedule.iterrows():
            if pd.notna(race['Session5Date']):  # Has race session
                races.append({
                    "round": int(race['RoundNumber']),
                    "name": race['EventName'],
                    "location": race['Location'],
                    "country": race['Country']
                })
        
        return jsonify(races)
    except Exception as e:
        logger.error(f"Error getting race schedule for {year}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/drivers/<int:year>/<race_name>')
def get_drivers(year, race_name):
    """Get drivers for a specific race"""
    try:
        # Load race session
        race = fastf1.get_session(year, race_name, 'R')
        race.load()
        
        drivers = []
        for driver_code in race.drivers:
            driver_info = race.get_driver(driver_code)
            team_name = driver_info.get('TeamName', 'Unknown')
            
            drivers.append({
                "code": driver_code,
                "name": f"{driver_info.get('FirstName', '')} {driver_info.get('LastName', '')}".strip(),
                "team": team_name,
                "color": TEAM_COLORS.get(team_name, '#CCCCCC')
            })
        
        return jsonify(drivers)
    except Exception as e:
        logger.error(f"Error getting drivers for {year} {race_name}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/lap-times')
def get_lap_times():
    """Get lap times for specific drivers in a race"""
    try:
        year = int(request.args.get('year'))
        race_name = request.args.get('race')
        drivers_param = request.args.get('drivers')
        
        if not all([year, race_name, drivers_param]):
            return jsonify({"error": "Missing required parameters"}), 400
        
        driver_codes = [d.strip() for d in drivers_param.split(',')]
        
        # Load race session
        race = fastf1.get_session(year, race_name, 'R')
        race.load()
        
        lap_data = {}
        
        for driver_code in driver_codes:
            try:
                # Use pick_drivers (newer API) instead of pick_driver
                driver_laps = race.laps.pick_drivers([driver_code])
                
                # Convert to JSON-serializable format
                laps = []
                for _, lap in driver_laps.iterrows():
                    # Check for valid lap time (should be between 60-200 seconds for F1)
                    if (pd.notna(lap['LapTime']) and 
                        lap['LapTime'].total_seconds() > 60 and 
                        lap['LapTime'].total_seconds() < 200):
                        
                        laps.append({
                            "lap": int(lap['LapNumber']),
                            "time": float(lap['LapTime'].total_seconds()),
                            "sector1": float(lap['Sector1Time'].total_seconds()) if pd.notna(lap['Sector1Time']) else None,
                            "sector2": float(lap['Sector2Time'].total_seconds()) if pd.notna(lap['Sector2Time']) else None,
                            "sector3": float(lap['Sector3Time'].total_seconds()) if pd.notna(lap['Sector3Time']) else None,
                            "compound": lap.get('Compound', 'Unknown'),
                            "pit_out_time": lap.get('PitOutTime') is not None,
                            "pit_in_time": lap.get('PitInTime') is not None
                        })
                
                # Skip drivers with no valid laps
                if not laps:
                    logger.warning(f"No valid laps found for driver {driver_code}")
                    continue
                
                # Get driver info
                driver_info = race.get_driver(driver_code)
                team_name = driver_info.get('TeamName', 'Unknown')
                
                lap_data[driver_code] = {
                    "driver": {
                        "code": driver_code,
                        "name": f"{driver_info.get('FirstName', '')} {driver_info.get('LastName', '')}".strip(),
                        "team": team_name,
                        "color": TEAM_COLORS.get(team_name, '#CCCCCC')
                    },
                    "laps": laps
                }
                
            except Exception as driver_error:
                logger.error(f"Error processing driver {driver_code}: {str(driver_error)}")
                continue
        
        return jsonify(lap_data)
        
    except Exception as e:
        logger.error(f"Error getting lap times: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/telemetry')
def get_telemetry():
    """Get telemetry data for a specific driver and lap"""
    try:
        year = int(request.args.get('year'))
        race_name = request.args.get('race')
        driver_code = request.args.get('driver')
        lap_number = int(request.args.get('lap'))
        
        if not all([year, race_name, driver_code, lap_number]):
            return jsonify({"error": "Missing required parameters"}), 400
        
        # Load race session
        race = fastf1.get_session(year, race_name, 'R')
        race.load()
        
        # Get specific lap
        lap = race.laps.pick_driver(driver_code).pick_lap(lap_number)
        telemetry = lap.get_telemetry()
        
        # Convert to JSON-serializable format
        tel_data = []
        for _, point in telemetry.iterrows():
            tel_data.append({
                "distance": float(point['Distance']),
                "speed": float(point['Speed']) if pd.notna(point['Speed']) else 0,
                "throttle": float(point['Throttle']) if pd.notna(point['Throttle']) else 0,
                "brake": bool(point['Brake']) if pd.notna(point['Brake']) else False
            })
        
        return jsonify({
            "driver": driver_code,
            "lap": lap_number,
            "telemetry": tel_data
        })
        
    except Exception as e:
        logger.error(f"Error getting telemetry: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)