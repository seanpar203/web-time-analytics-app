/**
 * Created by sean on 15/08/2016.
 */

// Basic Variables
let host = window.location.host;
let sendMessage = chrome.runtime.sendMessage;

sendMessage({
    message: 'newTab',
    tabUrl: host
}, (response) => {
    console.log(response.farewell);
});