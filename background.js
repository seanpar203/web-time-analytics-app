/**
 * Created by sean on 15/08/2016.
 */

let tabs = [];

chrome.runtime.onMessage.addListener((req, sender, res) => {
    switch (req.message) {
    case 'newTab':
        tabs.push(req.tabUrl);
        break;

    case 'closeUrl':
        tabs.splice(tabs.indexOf(req.tabUrl), 1);
        break;
    }
});