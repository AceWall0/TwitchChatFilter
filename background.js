"use strict";

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({
        'filters': {
            'msgs': [],
            'users': [],
            'emotes': []
        },
        'isON': true,
        'ctg': 'msgs',
        'options': {
            'wholeWord': true,
            'ignoreCase': true,
            'stripWS': true
        }
    })
})