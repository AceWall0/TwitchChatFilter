"use strict";

const mainObserver = new MutationObserver(observeNewChat)
const chatObserver = new MutationObserver(filterChat)
let isON
let options
let filters
let mainContent
let currentChat

// This is changed by the options in the init()
let createRegex  = (subString) => {return new RegExp('')}
let equalStrings = (a, b) => {return false}


init()

function init() {
    observeMain()
    observeNewChat()
    loadFilters()

    chrome.storage.local.get(['isON', 'options', 'filters'], function (result) {
        isON = result['isON']
        if (isON) hideFiltered(true)
        filters = result['filters']
        options = result['options']
        createRegex = getMatchingStrategy(options)
        equalStrings = getEqualStringsStrategy(options.ignoreCase)
    })

    chrome.storage.local.onChanged.addListener(changes => {
        if (changes['filters']) {
            filters = changes['filters'].newValue
        }
        else if (changes['isON']) {
            isON = changes['isON'].newValue
            hideFiltered(isON)
        }
        else if (changes['options']) {
            options = changes['options'].newValue
            createRegex = getMatchingStrategy(options)
            equalStrings = getEqualStringsStrategy(options.ignoreCase)
        }
    })
}


function hideFiltered(on) {
    const display = on ? 'none' : 'initial'
    document.documentElement.style.setProperty('--msgDisplay', display)
}


// 1)
async function observeMain() {
    const main = await loadMain() //->(2)
    if(main) {
        mainObserver.observe(main, { childList: true }) //->(3)
    }
}

// 2)
async function loadMain() {
    let tries = 10
    while(tries > 0) {
        mainContent = document.querySelector('.root-scrollable__wrapper')
        if (mainContent) {
            return mainContent //->(1)
        }
        tries--
        await sleep(500)
    }
    console.warn('Could not load the page main content.')
}

// 3)
async function observeNewChat(mutationList) {
    clearTimeout(observeNewChat.timerId)

    const newChat = await getChatFeed() //->(4)
    
    if (newChat != currentChat) {
        currentChat = newChat
        chatObserver.observe(currentChat, {childList: true}) //->(5)
        console.log('Chat updated', currentChat)
    } 
    observeNewChat.timerId = setTimeout(observeNewChat, 2000)
}

// 4)
async function getChatFeed() {
    let tries = 10
    while(tries > 0) {
        let tempChat = null
        tempChat = document.querySelector(".chat-scrollable-area__message-container")
        if (tempChat) {
            return tempChat //->(3)
        }
        tries--
        await sleep(300)
    }
}


/** 5) 
 * @param {MutationRecord[]} mutationList 
 * */
function filterChat(mutationList) {
    for (const mutationRecord of mutationList) {    
        for (const message of mutationRecord.addedNodes) {
            const user = getUsername(message)
            const text = getTexts(message)
            const emotes = getEmotes(message)

            if (isBlockedUser(user) || 
                isBlockedMsg(text) || 
                isBlockedEmote(emotes)) {
                message.classList.add('hiddenMessage')
            }
        }
    }
}

function isBlockedUser(user) {
    for (const blockedUser of filters.users) {
        if (equalStrings(blockedUser, user)) {
            return true
        }
    }
}

function isBlockedEmote(emoteList) {
    for (const blockedEmote of filters.emotes) {
        for (const emote of emoteList) {
            if (equalStrings(blockedEmote, emote)) { 
                return true 
            }
        }
    }
}

function isBlockedMsg(subject, wholeWord=true) {
    for (const blockedWord of filters.msgs) {
        if (createRegex(blockedWord).test(subject)) return true
    }
}

function getMatchingStrategy(options) {
    const caseSensitive = options.ignoreCase ? '' : 'i'
    if (options.wholeWord) {
        return search => new RegExp(`\\b${search}\\b`, caseSensitive)
    } else {
        return search => new RegExp(search, 'i')
    }
}

function getEqualStringsStrategy(ignoreCase) {
    if (ignoreCase) {
        return (a, b) => a.toLowerCase() == b.toLowerCase()
    } else {
        return (a, b) => a == b
    }
}

function loadFilters() {
    chrome.storage.local.get('filters', function (result) {
        filters = result['filters']
    })
}

function getUsername(node) {
    const usernameElement = node.querySelector('.chat-line__username')
    return usernameElement ? usernameElement.innerText : ""
}

function getTexts(node) {
    const textElements = node.querySelectorAll('.text-fragment')
    let text = ""
    for (const element of textElements) {
        text += element.innerText.trim() + " "
    }
    return text
}

function getEmotes(node) {
    const emoteElements = node.querySelectorAll('.chat-image')
    let emotesList = []
    for (const emote of emoteElements) {
        emotesList.push(emote.alt.toLowerCase())
    }
    return emotesList
}

async function sleep(ms) {
    return new Promise(_ => setTimeout(_, ms))
}