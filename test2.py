import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import fastf1 as ff1
from fastf1 import utils
from fastf1 import plotting
plotting.setup_mpl()

ff1.Cache.enable_cache('/home/frowtch/projects/F1/cache')

russian_race = ff1.get_session(2021, 'Sochi', 'R')
laps_r = russian_race.load_laps(with_telemetry=True)

russian_race = ff1.get_session(2021, 'Sochi', 'R')
ham_fastest_lap = laps_r.pick_driver('HAM').pick_fastest()

ham_car_data = ham_fastest_lap.get_car_data()
t = ham_car_data['Time']
velocity = ham_car_data['Speed']
fig, ax = plt.subplots(figsize=(12,8))
ax.plot(t, velocity, label='Fast')
ax.set_xlabel('Time')
ax.set_ylabel('Speed [Km/h]')
ax.set_title("Hamilton's fastest lap")
ax.legend()
plt.show()

race = ff1.get_session(2021, 'Sochi', 'R')
laps = race.load_laps(with_telemetry=True)
ver = laps.pick_driver('NOR')
ham = laps.pick_driver('HAM')
fig, ax = plt.subplots(figsize=(10,6))
ax.plot(ver['LapNumber'], ver['LapTime'], color='orange')
ax.plot(ham['LapNumber'], ham['LapTime'], color='cyan')
ax.set_title("Norris vs Hamilton ")
ax.set_xlabel("Lap Number")
ax.set_ylabel("Lap Time")
plt.legend(['NOR','HAM'])

plt.show()
