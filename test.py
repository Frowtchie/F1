#!/usr/bin/env python
# -*- coding: utf-8 -*-

##################################################
## Personal project to test and play around Fast-F1 Github project. Aim is to build a website on-top of it in the future.
##################################################
## Author: Frowtch
## Copyright: Copyright 2022, F1-Insert-Name project
## License: MPL 2.0
## Version: 1.0.0
## Maintainer: Frowtch
## Contact: Frowtch#0001 on Discord
## Status: WIP
##################################################

import fastf1
from fastf1 import plotting
from matplotlib import pyplot as plt

plotting.setup_mpl()

fastf1.Cache.enable_cache('/home/frowtch/projects/F1/cache')  # optional but recommended

race = fastf1.get_session(2020, 'Turkish Grand Prix', 'R')
laps = race.load_laps()

lec = laps.pick_driver('LEC')
ham = laps.pick_driver('HAM')

fig, ax = plt.subplots()
ax.plot(lec['LapNumber'], lec['LapTime'], color='red')
ax.plot(ham['LapNumber'], ham['LapTime'], color='cyan')
ax.set_title("LEC vs HAM")
ax.set_xlabel("Lap Number")
ax.set_ylabel("Lap Time")
plt.show()
