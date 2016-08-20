/**
 * Created by sean on 15/08/2016.
 */
(() => {

	// Default State Variables.
	let tabs = [];
	let currentTabSet = false;
	let currentTab = {
		name: '',
		seconds: 0
	};

	// Chrome API Reassignment
	let tabQuery = chrome.tabs.query;
	let sendMessage = chrome.tabs.sendMessage;

	// Chrome Listeners & Handlers
	chrome.runtime.onMessage.addListener(messageHandler);
	chrome.tabs.onActivated.addListener(activateHandler);


	/**
	 * Handles adding and removing tabs from tabs array.
	 * @param {object} req - Object message sent from content.js
	 * @param {object} sender - Object containing data related to tab.
	 * @param {method} res - method for returning a response
	 */
	function messageHandler(req, sender, res) {

		// Handle Message Accordingly
		switch (req.message) {
			case 'newTab':
				handleNewTab();
				newTabResponse();
				break;

			case 'closeTab':
				handleCloseTab();
				removeTabResponse();
				break;
		}

		/**
		 * Adds tab to tabs array & returns message to content.js
		 */
		function handleNewTab() {
			tabs.push(req.tab);
		}

		/**
		 * Removes tab from tabs array & returns message to content.js
		 */
		function handleCloseTab() {
			tabs.splice(tabs.indexOf(req.tab), 1);
		}

		/**
		 * Sends response of new tab to content.js
		 */
		function newTabResponse() {
			res({message: `Added tab with url ${req.tab}`});
		}

		/**
		 * Sends response of removal of tab to content.js
		 */
		function removeTabResponse() {
			res({message: `Removed tab with url ${req.tab}`});
		}
	}

	/**
	 * Handles Setting current tab.
	 * @param tab
	 */
	function activateHandler(tab) {
		requestTabUrl();

		/**
		 * Requests current tabs host name ex: www.facebook.com
		 */
		function requestTabUrl() {
			sendMessage(tab.tabId, {message: 'tabHostName'}, handleResponse)
		}

		/**
		 * Handles response from requestTabUrl method.
		 * @param {object} res - response object with data sent from content.js
		 */
		function handleResponse(res) {
			console.log(res.hostName);
		}
	}


	function startCounter() {
		while (currentTabSet) {
			setInterval(increment, 1000)
		}
	}

	function increment() {
		currentTab.seconds++;
	}

})();
