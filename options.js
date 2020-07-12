const stripWSCB = document.getElementById('stripWS')
const wholeWordCB = document.getElementById('wholeWord')
const ignoreCaseCB = document.getElementById('ignoreCase')

chrome.storage.local.get('options', res => {
    stripWSCB.checked = res.options.stripWS
    wholeWordCB.checked = res.options.wholeWord
    ignoreCaseCB.checked = res.options.ignoreCase
})

document.querySelectorAll('input').forEach(e => {
    e.addEventListener('change', saveOptions)
})


function saveOptions() {
    chrome.storage.local.set({
        'options': {
            'stripWS': stripWSCB.checked,
            'wholeWord': wholeWordCB.checked,
            'ignoreCase': ignoreCaseCB.checked
        }
    })
}