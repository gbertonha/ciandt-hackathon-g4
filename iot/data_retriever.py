#!/usr/bin/env python
# -*- coding: utf-8 -*-

import firebase_admin
from firebase_admin import credentials, firestore

class DataRetriever(object):
    def __init__(self):
        cred = credentials.Certificate('key.json')
        firebase_admin.initialize_app(cred)
        self.database = firestore.client()

    def retrieve_latest_from_firestore(self, collection):
        retrieved_collections = self.database.collection(collection).get()
        collection_data = []
        for data in retrieved_collections:
            collection_data.append(data.to_dict())

        return collection_data[-2]

    def retrieve_turn_off_msg(self):

        try:
            turn_off_msg_data = self.retrieve_latest_from_firestore("turn_off_msg")
            return turn_off_msg_data["value"]
        except:
            return None
