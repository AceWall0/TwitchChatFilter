"use strict";

document.querySelector('input').addEventListener('keypress',  inputEnter)
document.querySelector('#addBtn').addEventListener('click', addTerm)
document.querySelector('.powerBtn').addEventListener('click', toggle)
const template = document.querySelector('template')
const filterList = document.querySelector('#filter-list')
const navButtons = document.querySelectorAll('.nav-btn')
let selectedNavBtn = document.querySelector('.nav-btn.selected')
let filters
let currCtg 
let isON 
let stripWS


chrome.storage.local.get(['filters', 'isON', 'ctg', 'options'], function (result) {
    filters = result['filters']
    currCtg = result['ctg']
    selectCategory(currCtg)

    isON = result['isON']
    if (isON) document.querySelector('.powerBtn').classList.add('powerBtn-on')
    else      document.querySelector('.powerBtn').classList.add('powerBtn-off')

    stripWS = result['options']['stripWS']
})

navButtons.forEach(elem => elem.addEventListener('click', () => {
    const ctg = elem.dataset.ctg
    selectCategory(ctg)
}))

function selectCategory(ctg) {
    currCtg = ctg
    console.log(ctg);
    
    selectedNavBtn?.classList.remove('selected')
    selectedNavBtn = document.querySelector(`.nav-btn[data-ctg=${ctg}]`)
    selectedNavBtn.classList.add('selected')
    fillList(ctg)
    chrome.storage.local.set({'ctg': ctg})
}

function fillList(category) {
    filterList.innerHTML = ''
    
    for (const term of filters[category]) {
        displayTerm(term)
    }
}

function toggle(e) {
    const elem = e.currentTarget
    elem.classList.toggle('powerBtn-on')
    elem.classList.toggle('powerBtn-off')
    isON = !isON
    chrome.storage.local.set({'isON': isON})
}

function updateStorage() {
    chrome.storage.local.set({'filters': filters})
}

function addInCurrCategory(value) {
    const ctg = selectedNavBtn.dataset.ctg
    filters[ctg].push(value)
    updateStorage()
}

function removeFromCurrCategory(value) {
    const ctg = selectedNavBtn.dataset.ctg
    const index = filters[ctg].indexOf(value)
    filters[ctg].splice(index, 1)
    updateStorage()
}

function displayTerm(term) {
    const clone = template.content.cloneNode(true)
    clone.querySelector('li').append(term)
    clone.querySelector('.close').addEventListener('click', removeTerm)
    filterList.appendChild(clone)
    filterList.scroll(0, filterList.scrollHeight)
}

function addTerm() {
    const input = document.querySelector('input')
    let text = input.value
    if (stripWS) {
        text = text.trim()
    }
    if (text) {
        displayTerm(text)
        addInCurrCategory(text)
        input.value = ''
    }
}

function removeTerm(event) {
    const caller = event.target
    const value = caller.nextSibling.textContent
    const parent = caller.parentNode
    
    removeFromCurrCategory(value)
    parent.remove()
}


function inputEnter(event) {
    if (event.keyCode === 13) {
        addTerm()
    }
}