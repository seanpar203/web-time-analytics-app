/** Created by sean on 15/08/2016. */

(() => {
	// Constants
	const BASE_URL = 'http://localhost:5000/api/';
	const TAB_QUERY_CONFIG = {
		active:        true,
		currentWindow: true
	};

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
			url:         `${BASE_URL}${url}/`,
			contentType: "application/json; charset=utf-8",
		})

	}

	/**
	 * http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
	 * Returns host name from string url.
	 * @param url - Value of entire url.
	 * @returns {*} - Value of host name.
	 */
	function getHostName(url) {
		var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
		if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
			return match[2];
		}
		else {
			return null;
		}
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
			let _token;

			// Exposed Methods.
			/** Returns object with token value. */
			this.state = () => ({token: _token});

			getStorage('WTA_TOKEN', obj => {
				_token = isEmpty(obj) ? genToken() : obj.WTA_TOKEN
			});
		}
	}

	/** Class Representing Counter State */
	class Counter {
		constructor() {
			// Attributes
			let _seconds = 0;
			let _interval;

			// Exposed Methods.
			/** Returns object with minutes value. */
			this.state = () => ({seconds: _seconds});

			/** Start counter interval. */
			this.start = () => {
				_interval = setInterval(() => {
					_seconds++
				}, 1000);
			};

			this.stop = () => {
				clearInterval(_interval);
				_seconds = 0;
			}
		}
	}

	/** Class Representing host name State */
	class HostName {
		constructor() {
			let _hostName = '';

			/** Sets new host name state. */
			this.setHost = (host) => _hostName = host;

			this.len = () => _hostName.length;

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
			const _saveTimeSpent = () => saveData('time', _getState());
			const _getState = () => Object.assign({}, _token.state(), _host.state(), _counter.state());

			const _startTracking = hostName => {
				_host.setHost(hostName);
				_counter.start()
			};

			const _saveAndStart = hostName => {
				console.log(_getState());
				_counter.stop();
				_saveTimeSpent();
				_startTracking(hostName);
			};


			/**
			 * onActivated callback.
			 * @param {object} tab - object containing tab id and window id.
			 */
			this.onActivated = tab => {
				tabQuery(TAB_QUERY_CONFIG, tabs => {
					let hostName = getHostName(tabs[0].url);
					_host.len() === 0
						? _startTracking(hostName)
						: _saveAndStart(hostName);
				});
			};
		}
	}

	// Create new Instances of Manager.
	const BGM = new BackgroundManager();

	// Chrome Listeners & Handlers.
	chrome.tabs.onActivated.addListener(BGM.onActivated);
})();