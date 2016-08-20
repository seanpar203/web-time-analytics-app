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
		console.log(req, sender, res);
		// Handle Message Accordingly
		switch (req.message) {
			case 'urlRequest':
				res({url: host});
				break;
		}
	}


	// On Every Page Load.
	sendMessage({
		message: 'newTab',
		tab: host
	}, (response) => {
		console.log(response.message);
	});
})();
