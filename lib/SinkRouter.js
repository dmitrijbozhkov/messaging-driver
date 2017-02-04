"use strict";
var AbstractBroker_1 = require("./AbstractBroker");
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
    /*
    private findBroker(name: string) {
        return this.brokers[name];
    }
    private getSinkBroker(message: SinkMessages) {
        let broker: IBroker;
        if (message.envelope.target) {
            broker = this.findBroker(message.envelope.target.splice(0, 1)[0]);
            if (broker) {
                return broker;
            } else {
                throw new Error("No such target");
            }
        } else {
            broker = this.findBroker("self");
            if (broker) {
                return broker;
            } else {
                throw new Error("No self target");
            }
        }
    }
    */
    SinkRouter.prototype.handleMessage = function (message) {
        this.broker.sendMessage(message);
    };
    SinkRouter.prototype.handlePublish = function (publish) {
        this.broker.sendPublish(publish);
    };
    SinkRouter.prototype.handleSubscription = function (subscribe) {
        this.broker.publishHandler(subscribe, subscribe.port);
    };
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
