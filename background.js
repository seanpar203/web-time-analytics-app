/**
 * Created by sean on 15/08/2016.
 */
(() => {

    /**
     * Class to manage active tab state and handle ajax requests.
     */
    class TabManager {

        /**
         * Creates basic properties for tab state.
         */
        constructor() {
            this.tabHost = '';
            this.tabSet = false;
        }

        /**
         * Sets tabHost property to reflect new active tab.
         * @param host
         */
        set host(host) {
            this.tabHost = host;
            this.tabSet = true;
        }

        /**
         * Gets tab state in object format for ajax request.
         * @returns {{host: (string|*), seconds: number}}
         */
        get tab() {
            return {
                host: this.tabHost,
                seconds: this.seconds,
            }
        }

        /**
         * Callback for onActivated requests active tabs host name on new active tab.
         * @param {object} tab - object containing tab id and window id.
         */
        activateHandler(tab) {
            // Message to send to content.js
            let msg = {
                message: 'host'
            };

            // sendMessage(tab.tabId, msg, res => {
            //     if (!this.tabSet) {
            //         this.host = res.host;
            //     } else {
            //         this.saveTab(this.tab);
            //         this.host = res.host;
            //     }
            // });
        }
    }

    class User {
        constructor() {
            this.email = '';
            this.id = '';
        }

        /**
         * Sets Users attributes.
         * @param user
         */
        set user(user) {
            this.email = user.email;
            this.id = user.id;
        }
    }

    class Counter {
        constructor() {
            this.seconds = 0;
        }

        /**
         * Callback for startCounter to increment seconds property.
         */
        increment() {
            this.seconds++;
        }

        /**
         * setInterval counter to increment seconds property every 1s, as long as
         * property currentTabSet is true.
         */
        startCounter() {
            const interval = setInterval(this.increment, 1000);
        }

        /**
         * Removes interval process
         */
        stopCounter() {
            clearInterval(interval)
        }
    }

    // Create new Instances of Classes.
    const user = new User();
    const TM = new TabManager();
    const counter = new Counter();

    // Chrome API Reassignment.
    const tabQuery = chrome.tabs.query;
    const sendMessage = chrome.tabs.sendMessage;

    // Chrome Listeners & Handlers.
    chrome.tabs.onActivated.addListener(TM.activateHandler.bind(TM));

})();