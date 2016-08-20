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
				handleNewTab(req.tab);
				break;

			case 'closeTab':
				handleCloseTab(req.tab);
				break;
		}

		/**
		 * Adds tab to tabs array & returns message to content.js
		 * @param {string} tab
		 */
		function handleNewTab(tab) {
			tabs.push(tab);
			sendNewTabMessage(tab);
		}

		/**
		 * Removes tab from tabs array & returns message to content.js
		 * @param {string} tab
		 */
		function handleCloseTab(tab) {
			tabs.splice(tabs.indexOf(tab), 1);
			sendRemoveTabMessage(tab);
		}

		/**
		 * Sends response of new tab to content.js
		 * @param tab
		 */
		function sendNewTabMessage(tab) {
			res({message: `Added tab with url ${tab}`});
		}

		/**
		 * Sends response of removal of tab to content.js
		 * @param tab
		 */
		function sendRemoveTabMessage(tab) {
			res({message: `Removed tab with url ${tab}`});
		}
	}

	/**
	 * Handles Setting current tab.
	 * @param tab
	 */
	function activateHandler(tab) {

		function requestTabUrl() {
			sendMessage(tab.tabId, {message: 'urlRequest'}, res => {
				currentTab.name = res.url;
			})
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
