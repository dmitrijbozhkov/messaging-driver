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
                this.handlePublish(m);
                break;
            case AbstractBroker_1.MessagingTypes[2]:
                this.handleSubscription(m);
                break;
            case AbstractBroker_1.MessagingTypes[3]:
                this.handleBroker(m);
                break;
            default:
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
     * Handles publish messages
     * @param publish Publish message that will send port
     */
    SinkRouter.prototype.handlePublish = function (publish) {
        this.broker.sendPublish(publish);
    };
    /**
     * Handles subscription to a port
     * @param subscribe Message with port to subscribe to
     */
    SinkRouter.prototype.handleSubscription = function (subscribe) {
        this.broker.publishHandler(subscribe, subscribe.port);
    };
    /**
     * Handles broker lifecycle messages
     * @param status Message with status
     */
    SinkRouter.prototype.handleBroker = function (status) {
        if (status.envelope.category === AbstractBroker_1.MessagingCategories[6]) {
            this.broker.attachTarget(status.target);
        }
        else if (status.envelope.category === AbstractBroker_1.MessagingCategories[7]) {
            this.broker.disposeTarget();
        }
        else {
            throw new Error("Wrong category");
        }
    };
    return SinkRouter;
}());
exports.SinkRouter = SinkRouter;
