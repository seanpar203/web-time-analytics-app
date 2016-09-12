/** Created by sean on 15/08/2016. */

$(() => {
	/** Sensible Constants */
	const BASE_URL = 'http://localhost:5000/api';

	// Chrome API Reassignment.
	const tabQuery = chrome.tabs.query;
	const setStorage = chrome.storage.sync.set;
	const getStorage = chrome.storage.sync.get;


	/** Helper functions that don't add to classes interface. */

	// Returns whether a object has keys or not.
	function isEmpty(obj) {
		if (obj === undefined) {
			return true;
		}
		return Object.keys(obj).length === 0;
	}

	 // Returns host name from string url.
	 // http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
	function getHostName(url) {
		var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
		if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
			return match[2];
		}
		else {
			return null;
		}
	}

	// Generates Token, saves it and returns it.
	function genToken() {
		let token = uuid.v4();
		setStorage({'WTA_TOKEN': token});
		return token;
	}


	// Generic Save Data Methods
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

	/**
	 * Classes below provide the main functionality.
	 *
	 * ~ Token
	 * ---------------------------------------------
	 * Provides unique identification for each user.
	 *
	 *
	 * ~ Counter
	 * ---------------------------------------------
	 * Manages active time spent on current tab.
	 *
	 *
	 * ~ HostName
	 * ---------------------------------------------
	 * Manages host name of active current tab.
	 *
	 *
	 * ~ BackgroundManager
	 * ---------------------------------------------
	 * Provides the main interface for interactions.
	 */


	class Token {
		constructor() {
			/** Attributes */
			let _token;

			/** Exposed Methods. */

			// Returns object with token value.
			this.state = () => ({token: _token});

			// Gets or creates Token
			getStorage('WTA_TOKEN', obj => _token = isEmpty(obj) ? genToken() : obj.WTA_TOKEN);
		}
	}

	class Counter {
		constructor() {

			/** Attributes. */
			let _seconds = 0;
			let _interval;
			let _counting = false;

			/** Private Methods. */

			// Starts counter.
			const _startCounter = () => {
				_interval = setInterval(() => {
					console.log(_seconds);
					_seconds++
				}, 1000);
			};


			/** Exposed Methods. */

			// Returns object with minutes value.
			this.state = () => ({seconds: _seconds});

			// Start counter interval from 0.
			this.start = () => {
				_seconds = 0;
				_counting = true;
				_startCounter();
			};

			// Clears interval.
			this.stop = () => {
				_counting = false;
				clearInterval(_interval);
			};

			// Adds new interval to continue counter
			this.continue = () => {
				_counting = true;
				_startCounter();
			};

			// Remove amount in seconds & stops counter.
			this.minusAndStop = (seconds) => {
				_seconds -= seconds;
				_counting = false;
				this.stop();
			};

			// Returns boolean value of counting
			this.isCounting = () => {
				return _counting;
			}
		}
	}

	class HostName {
		constructor() {
			/** Attributes */
			let _hostName = '';

			/** Exposed Methods */

			// Sets new host name state.
			this.setHost = (host) => _hostName = host;

			// Returns length of host name.
			this.len = () => _hostName.length;

			// Gets the current host name state.
			this.state = () => ({host: _hostName})
		}
	}

	class BackgroundManager {
		constructor() {
			/** Instances. */
			const _token = new Token();
			const _host = new HostName();
			const _counter = new Counter();

			/** Private Methods. */

			// Saves Date to DB.
			const _saveTimeSpent = () => saveData('/time', _getState(), _token.state().token);

			// Gets all the objects current state
			const _getState = () => Object.assign({}, _host.state(), _counter.state());

			// Start tracking time spent.
			const _startTracking = hostName => {
				_host.setHost(hostName);
				_counter.start()
			};

			// Saves & starts tracking
			const _saveAndStart = hostName => {
				if (_counter.isCounting()) {
					_counter.stop();
				}
				_saveTimeSpent();
				_startTracking(hostName);
			};


			/** Private Methods. */

			// onActivated callback
			this.onActivated = tab => {
				tabQuery({active: true, currentWindow: true}, tabs => {
					let hostName = getHostName(tabs[0].url);
					_host.len() === 0
						? _startTracking(hostName)
						: _saveAndStart(hostName);
				});
			};

			// On Message callback, sends token
			this.onMessage = (req, sender, res) => {
				res(_token.state())
			};

			// State change call back.
			this.onStateChanged = state => {
				if (state == 'idle' || state == 'locked') {
					_counter.minusAndStop(15);
				}
				else if (state == 'active') {
					_counter.continue();
				}
			}
		}
	}

	/** Kick Off. */

	// Create new Instances of Manager.
	const BGM = new BackgroundManager();

	// Set Idle Detection.
	chrome.idle.setDetectionInterval(15);

	// Chrome Listeners & Handlers.
	chrome.tabs.onActivated.addListener(BGM.onActivated);
	chrome.extension.onMessage.addListener(BGM.onMessage);
	chrome.idle.onStateChanged.addListener(BGM.onStateChanged);
});