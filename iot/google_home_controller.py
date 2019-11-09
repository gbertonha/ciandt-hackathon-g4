#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import print_function
from data_retriever import DataRetriever
import time
import pychromecast

class GoogleHomeController(object):
    interval = 300

    def __init__(self, device_name="Bedroom speaker"):
        print("Initializing...")
        self.data_retriever = DataRetriever()
        chromecasts = pychromecast.get_chromecasts()
        self.device_name = device_name
        print("Trying to connect to the smart devices")
        self.google_home = next(cc for cc in chromecasts if cc.device.friendly_name == self.device_name)
        self.google_home.wait()
        self.mc = self.google_home.media_controller
        self.ac_on = true

    def run(self):
        try:
            while True:
                turn_off_msg_val = self.data_retriever.retrieve_turn_off_msg()
                if turn_off_msg_val == 0 and self.ac_on == True:
                    print("Trying to turn off the AC now")
                    self.mc.play_media('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'video/mp4')
                    self.mc.block_until_active()
                    self.ac_on = False
                    print("The AC is off")

                time.sleep(self.interval)
        finally:
            print("app close")

def main():
    ghc = GoogleHomeController()
    ghc.run()

if __name__ == '__main__':
    main()
