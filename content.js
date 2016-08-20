/**
 * Created by sean on 15/08/2016.
 */

(() => {

	// Chrome Listeners
	chrome.runtime.onMessage.addListener(messageHandler);


	/**
	 * Handles sending data to background.js
	 * @param {object} req - Object message sent from content.js
	 * @param {object} sender - Object containing data related to tab.
	 * @param {method} res - method for returning a response
	 */
	function messageHandler(req, sender, res) {

		// Handle Message Accordingly
		switch (req.message) {
			case 'tabHostName':
				hostNameRequest();
				break;
		}

		/**
		 * Returns the current tabs hostname as response to message.
		 */
		function hostNameRequest() {
			let host = window.location.host;
			res({hostName: host});
		}
	}
})();
