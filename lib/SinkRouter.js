"use strict";
var AbstractBroker_1 = require("./AbstractBroker");
var SinkRouter = (function () {
    function SinkRouter(brokers) {
        this.brokers = brokers;
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
    SinkRouter.prototype.findBroker = function (name) {
        return this.brokers[name];
    };
    SinkRouter.prototype.getSinkBroker = function (message) {
        var broker;
        if (message.envelope.target) {
            broker = this.findBroker(message.envelope.target.splice(0, 1)[0]);
            if (broker) {
                return broker;
            }
            else {
                throw new Error("No such target");
            }
        }
        else {
            broker = this.findBroker("self");
            if (broker) {
                return broker;
            }
            else {
                throw new Error("No self target");
            }
        }
    };
    SinkRouter.prototype.handleMessage = function (message) {
        var broker = this.getSinkBroker(message);
        broker.sendMessage(message);
    };
    SinkRouter.prototype.handlePublish = function (publish) {
        var broker = this.getSinkBroker(publish);
        broker.sendPublish(publish);
    };
    SinkRouter.prototype.handleSubscription = function (subscribe) {
        var broker = this.getSinkBroker(subscribe);
        broker.publishHandler(subscribe, subscribe.port);
    };
    SinkRouter.prototype.handleBroker = function (status) {
        var broker = this.getSinkBroker(status);
        if (status.envelope.category === AbstractBroker_1.MessagingCategories[6]) {
            broker.attachTarget(status.target);
        }
        else if (status.envelope.category === AbstractBroker_1.MessagingCategories[7]) {
            broker.disposeTarget();
        }
        else {
            throw new Error("Wrong category");
        }
    };
    return SinkRouter;
}());
exports.SinkRouter = SinkRouter;
