/** Created by sean on 15/08/2016. */

(() => {

	// Chrome API Reassignment.
	const tabQuery = chrome.tabs.query;
	const setStorage = chrome.storage.sync.set;
	const getStorage = chrome.storage.sync.get;
	const sendMessage = chrome.tabs.sendMessage;

	// Helper functions that don't add to classes interface.
	/**
	 * Returns whether a object has keys or not.
	 * @param {object} obj
	 * @returns {boolean}
	 */
	function isEmpty(obj) {
		if (obj === undefined) {
			return true;
		}
		return Object.keys(obj).length === 0;
	}

	/**
	 * Generates Token, saves it and returns it.
	 * @returns {string} value of gen'd token.
	 */
	function genToken() {
		let token = uuid.v4();
		setStorage({'WTA_TOKEN': token});
		return token;
	}


	/** Class Representing Token State */
	class Token {
		constructor() {
			// Attributes
			const _getOrCreate = () => getStorage('WTA_TOKEN', _validate);
			const _validate = obj => isEmpty(obj) ? _saveToken() : obj.WTA_TOKEN;
			const _token = _getOrCreate();

			/** Saves new token in db */
			const _saveToken = () => {
				$.ajax({
					type: 'POST',
					dataType: 'json',
					url: 'http://localhost:5000/user/create/',
					data: JSON.stringify({token: genToken()}),
					contentType: "application/json; charset=utf-8",
				})
			};

			// Exposed Methods.
			/** Returns object with token value. */
			this.state = () => ({token: _token});
		}
	}

	/** Class Representing Counter State */
	class Counter {
		constructor() {
			// Attributes
			let _seconds = 0;
			const _increment = () => _seconds++;

			// Exposed Methods.
			/** Returns object with minutes value. */
			this.state = () => ({seconds: _seconds / 60});

			/** Start counter interval. */
			this.start = () => {const interval = setInterval(_increment, 1000);};

			/** Stops counter interval. */
			this.stop = () => clearInterval(interval);
		}
	}

	/** Class Representing host name State */
	class HostName {
		constructor() {
			let _hostName = '';

			/** Sets new host name state. */
			this.setHost = (host) => _hostName = host;

			/** Gets the current host name state. */
			this.state = () => ({host: _hostName,})
		}
	}


	/** Master Class Representing Main Interface. */
	class BackgroundManager {
		constructor() {
			const _token = new Token();
			const _host = new HostName();
			const _counter = new Counter();

			/**
			 * onActivated callback.
			 * @param {object} tab - object containing tab id and window id.
			 */
			this.onActivated = tab => {
				let msg = {
					message: 'host'
				};

				sendMessage(tab.tabId, msg, res => {
					console.log(res);
				});
			};
		}
	}

	// Create new Instances of Manager.
	const BGM = new BackgroundManager();

	// Chrome Listeners & Handlers.
	chrome.tabs.onActivated.addListener(BGM.onActivated);
})();