/**
 * Created by sean on 15/08/2016.
 */

(() => {
	let host = window.location.host;
	let sendMessage = chrome.runtime.sendMessage;

	sendMessage({
		message: 'newTab',
		tab: host
	}, (response) => {
		console.log(response.message);
	});
})();
