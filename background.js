/**
 * Created by sean on 15/08/2016.
 */
(() => {
	// Create new TabManager Class.
	const TM = new TabManager();

	// Chrome API Reassignment.
	let tabQuery = chrome.tabs.query;
	let sendMessage = chrome.tabs.sendMessage;

	// Chrome Listeners & Handlers.
	chrome.tabs.onActivated.addListener(TM.activateHandler);


	/**
	 * Class to manage active tab state and handle ajax requests.
	 */
	class TabManager {

		/**
		 * Creates basic properties for tab state.
		 */
		constructor() {
			this.seconds = 0;
			this.tabHost = '';
			this.currentTabSet = false;
		}

		/**
		 * Sets tabHost property to reflect new active tab.
		 * @param host
		 */
		set tab(host) {
			this.currentTabSet = false;
			this.saveTab();
			this.tabHost = host;
			this.seconds = 0;
		}

		/**
		 * Gets tab state in object format for ajax request.
		 * @returns {{host: (string|*), seconds: number}}
		 */
		get activeTab() {
			return {
				host: this.tabHost,
				seconds: this.seconds
			}
		}

		/**
		 * Callback for onActivated requests active tabs host name on new active tab.
		 * @param {object} tab - object containing tab id and window id.
		 */
		activateHandler(tab) {
			sendMessage(tab.tabId,
				{message: 'tabHostName'},
				(res) => console.log(res))
		}


		saveTab() {
			// $.ajax({
			// 	type: 'POST',
			// 	dataType: 'json',
			// 	data: JSON.stringify(this.activeTab)
			// })

			$.ajax('http://jsonplaceholder.typicode.com/posts', {
				 method: 'POST',
				 data: {
					 title: 'foo',
					 body: 'bar',
					 userId: 1
				 }
			 })
			 .then(function (data) {
				 console.log(data);
			 });
		}

		/**
		 * setInterval counter to increment seconds property every 1s as long as
		 * property currentTabSet is true.
		 */
		startCounter() {
			while (this.currentTabSet) {
				setInterval(this.increment, 1000)
			}
		}

		/**
		 * Callback for startCounter to increment seconds property.
		 */
		increment() {
			this.seconds++;
		}
	}

})();
