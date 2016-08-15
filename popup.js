document.addEventListener('DOMContentLoaded', () => {
    "use strict";

    // Set Basic Variable Defaults.
    let btn = document.getElementById('btn');
    let bkp = chrome.extension.getBackgroundPage();
    let tabQuery = chrome.tabs.query;

    btn.addEventListener('click', () => {
        tabQuery({active: true}, (tabs) => {
            let [tab] = tabs;
            bkp.console.log(tab)
        });
    });
});