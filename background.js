/** Created by sean on 15/08/2016. */

$(() => {
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

	// Helper functions that don't add to classes interface.
	/** Returns whether a object has keys or not. */
	function isEmpty(obj) {
		if (obj === undefined) {
			return true;
		}
		return Object.keys(obj).length === 0;
	}

	/**
	 * Returns host name from string url.
	 * http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
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

	/** Generates Token, saves it and returns it. */
	function genToken() {
		let token = uuid.v4();
		setStorage({'WTA_TOKEN': token});
		return token;
	}


	/** Generic Save Data Methods */
	function saveData(url, data, token) {
		$.ajax({
			type:        'POST',
			url:         `${BASE_URL}${url}`,
			data:        JSON.stringify(data),
			headers:     {'Authorization': token},
			dataType:    'json',
			contentType: "application/json",
		})
	}


	/** Class Representing Token State */
	class Token {
		constructor() {
			// Attributes
			let _token;

			// Exposed Methods.
			/** Returns object with token value. */
			this.state = () => ({token: _token});

			/** Gets or creates Token */
			getStorage('WTA_TOKEN', obj => _token = isEmpty(obj) ? genToken() : obj.WTA_TOKEN);
		}
	}

	/** Class Representing Counter State */
	class Counter {
		constructor() {
			// Attributes.
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

			/** Clears interval & rests seconds */
			this.stop = () => {
				clearInterval(_interval);
				_seconds = 0;
			}
		}
	}

	/** Class Representing HostName State */
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
			/** Instances. */
			const _token = new Token();
			const _host = new HostName();
			const _counter = new Counter();

			/** Saves Date to DB. */
			const _saveTimeSpent = () => saveData('time/', _getState(), _token.state().token);

			/** Gets all the objects current state */
			const _getState = () => Object.assign({}, _host.state(), _counter.state());

			/** Start tracking time spent. */
			const _startTracking = hostName => {
				_host.setHost(hostName);
				_counter.start()
			};

			/** Saves & starts tracking */
			const _saveAndStart = hostName => {
				_saveTimeSpent();
				_counter.stop();
				_startTracking(hostName);
			};


			/** onActivated callback
			 *
			 * Notes:
			 *    Gets active tab.
			 *    Checks if there is a previous active tab.
			 *    Saves and sets new tab if (2) is true.
			 *    Sets new host name and starts counter.
			 */
			this.onActivated = tab => {
				tabQuery(TAB_QUERY_CONFIG, tabs => {
					let hostName = getHostName(tabs[0].url);
					_host.len() === 0
						? _startTracking(hostName)
						: _saveAndStart(hostName);
				});
			};

			this.onMessage = (req, sender, res) => {
				res(_token.state())
			}
		}
	}

	// Create new Instances of Manager.
	const BGM = new BackgroundManager();

	// Chrome Listeners & Handlers.
	chrome.tabs.onActivated.addListener(BGM.onActivated);
	chrome.extension.onMessage.addListener(BGM.onMessage);
});