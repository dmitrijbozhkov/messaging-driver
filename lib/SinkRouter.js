"use strict";
var AbstractBroker_1 = require("./AbstractBroker");
/**
 * Class that routes messages that will be send to IBroker class
 * @constructor Takes IBroker class
 */
var SinkRouter = (function () {
    function SinkRouter(broker) {
        this.broker = broker;
    }
    SinkRouter.prototype.next = function (m) {
        switch (m.envelope.type) {
            case AbstractBroker_1.MessagingTypes[0]:
                this.handleMessage(m);
                break;
            case AbstractBroker_1.MessagingTypes[1]:
                this.handleBroker(m);
                break;
            default:
                throw new Error("No such message type");
        }
    };
    SinkRouter.prototype.error = function (e) { };
    SinkRouter.prototype.complete = function () { };
    /**
     * Handles message with type message
     * @param message IBrokerMessage that will be send to broker
     */
    SinkRouter.prototype.handleMessage = function (message) {
        this.broker.sendMessage(message);
    };
    /**
     * Handles broker lifecycle messages
     * @param status Message with status
     */
    SinkRouter.prototype.handleBroker = function (status) {
        if (status.envelope.category === AbstractBroker_1.MessagingCategories[4]) {
            this.broker.attachTarget(status.target);
        }
        else if (status.envelope.category === AbstractBroker_1.MessagingCategories[5]) {
            this.broker.disposeTarget();
        }
        else {
            throw new Error("Wrong category");
        }
    };
    return SinkRouter;
}());
exports.SinkRouter = SinkRouter;
