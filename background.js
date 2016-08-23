/**
 * Created by sean on 15/08/2016.
 */
(() => {


	/** Class Representing User State */
	class User {
		/**
		 * Creates user state.
		 * @constructor
		 */
		constructor() {
			this.uid = '';
		}

		/**
		 * Sets Users attributes.
		 * @param {string} token - Unique string value.
		 */
		set token(token) {
			this.uid = token;
		}

		/**
		 * Returns object with uid value.
		 * @returns {{uid: (string|*|string)}} The value of uid.
		 */
		get state() {
			return {
				uid: this.uid
			}
		}
	}

	/** Class Representing Counter State */
	class Counter {
		/**
		 * Creates counter state.
		 * @constructor
		 */
		constructor() {
			this.seconds = 0;
		}

		/**
		 * Returns object with seconds value.
		 * @returns {{seconds: number}} The value of seconds.
		 */
		get state() {
			return {
				seconds: this.seconds
			}
		}

		/** startCounter interval callback. */
		increment() {
			this.seconds++;
		}

		/** Start counter interval. */
		start() {
			const interval = setInterval(this.increment, 1000);
		}

		/** Stops counter interval. */
		stop() {
			clearInterval(interval)
		}
	}

	/** Class Representing Tab State */
	class Tab {

		/**
		 * Creates tab state.
		 * @constructor
		 */
		constructor() {
			this.tabHost = '';
			this.tabSet = false;
		}

		/**
		 * Sets new tab state.
		 * @param {string} host - The new host name of active tab.
		 */
		set host(host) {
			this.tabHost = host;
			this.tabSet = true;
		}

		/**
		 * Gets the current tab state.
		 * @returns {{host: (string|*)}} The tabHost value.
		 */
		get state() {
			return {
				host: this.tabHost,
			}
		}
	}


	/** Master Class Representing Main Interface. */
	class BackgroundManager {

		/**
		 * Creates background state.
		 * @constructor
		 */
		constructor() {
			let _tab = new Tab();
			let _user = new User();
			let _counter = new Counter();

			/**
			 * onActivated callback.
			 * @param {object} tab - object containing tab id and window id.
			 */
			this.activateHandler = tab => {
				let msg = {
					message: 'host'
				};

				sendMessage(tab.tabId, msg, res => {
					console.log(res);
				});
			}
		}
	}

	// Create new Instances of Classes.
	const BGM = new BackgroundManager();

	// Chrome API Reassignment.
	const tabQuery = chrome.tabs.query;
	const sendMessage = chrome.tabs.sendMessage;

	// Chrome Listeners & Handlers.
	chrome.tabs.onActivated.addListener(BGM.activateHandler);

})();