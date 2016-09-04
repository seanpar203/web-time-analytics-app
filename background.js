/** Created by sean on 15/08/2016. */

(() => {
	// Constants
	const BASE_URL = 'http://localhost:5000/';

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


	function saveData(url, data) {
		$.ajax({
			type:        'POST',
			dataType:    'json',
			data:        JSON.stringify(data),
			url:         `${BASE_URL}${url}`,
			contentType: "application/json; charset=utf-8",
		})

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
			const _saveToken = () => saveData('user/create/', {token: genToken()});
			const _token = _getOrCreate();


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
			this.start = () => {
				_seconds = 0;
				const interval = setInterval(_increment, 1000);
			};
		}
	}

	/** Class Representing host name State */
	class HostName {
		constructor() {
			let _hostName = '';

			/** Sets new host name state. */
			this.setHost = (host) => _hostName = host;

			/** Gets the current host name state. */
			this.state = () => ({host: _hostName})
		}
	}


	/** Master Class Representing Main Interface. */
	class BackgroundManager {
		constructor() {
			const _token = new Token();
			const _host = new HostName();
			const _counter = new Counter();
			const _getState = () => Object.assign({}, _token.state(), _host.state(), _counter.state());
			const _saveTimeSpent = () => saveData('hello', _getState());

			const _startTracking = host => {
				_host.setHost(host);
				_counter.start()
			};


			/**
			 * onActivated callback.
			 * @param {object} tab - object containing tab id and window id.
			 */
			this.onActivated = tab => {
				sendMessage(tab.tabId, {message: 'host'}, res => {
					let host = _host.state();
					console.log(host);

					if (host.host.length === 0) {
						_startTracking(res.host);
					}
					else {
						_saveTimeSpent();
						_startTracking(res.host);
					}
				});
			};

		}
	}

	// Create new Instances of Manager.
	const BGM = new BackgroundManager();

	// Chrome Listeners & Handlers.
	chrome.tabs.onActivated.addListener(BGM.onActivated);
})();