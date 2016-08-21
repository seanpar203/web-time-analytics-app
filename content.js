/**
 * Created by sean on 15/08/2016.
 */

(() => {

	// Chrome Listeners
	chrome.runtime.onMessage.addListener(messageHandler);

	/**
	 * Handles sending data to background.js
	 * @param {object} req - Object message sent from background.js
	 * @param {object} sender - Object containing data related to message.
	 * @param {method} res - method for returning a response.
	 */
	function messageHandler(req, sender, res) {

		// Handle Message Accordingly
		switch (req.message) {
			case 'host':
				res({host: window.location.host});
				break;
		}
	}
})();
