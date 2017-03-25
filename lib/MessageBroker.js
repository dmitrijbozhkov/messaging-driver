"use strict";
var AbstractBroker_1 = require("./AbstractBroker");
var xstream_1 = require("xstream");
/** Passes messages to all the listeners */
var NotifyProducer = (function () {
    function NotifyProducer() {
        /** Listeners that will be notified with message */
        this.listeners = [];
    }
    NotifyProducer.prototype.start = function (listener) {
        this.listeners.push(listener);
    };
    NotifyProducer.prototype.trigger = function (message) {
        this.listeners.forEach(function (listener) {
            listener.next(message);
        });
    };
    NotifyProducer.prototype.stop = function () {
        this.listeners.forEach(function (listener) {
            listener.complete();
        });
    };
    return NotifyProducer;
}());
exports.NotifyProducer = NotifyProducer;
/**
 * Broker that manages objects of IMessageTargets
 * @constructor Initializes producers
 */
var MessageBroker = (function () {
    function MessageBroker() {
        /** Producers that will respond to target messages */
        this.MessageProducers = [];
        this.ErrorProducer = new NotifyProducer();
        this.DeadLetterProducer = new NotifyProducer();
        this.LifeCycleProducer = new NotifyProducer();
    }
    MessageBroker.prototype.messageHandler = function (message) {
        if (message.envelope.category === AbstractBroker_1.MessagingCategories[1]) {
            message.status = this.reportStatus(message.envelope.name);
        }
        this.MessageProducers.forEach(function (producer) {
            if (producer.name === message.envelope.name) {
                producer.producer.trigger(message);
            }
        });
    };
    MessageBroker.prototype.reportStatus = function (name) {
        var _this = this;
        return function (status) {
            var message = {
                envelope: {
                    type: AbstractBroker_1.MessagingTypes[0],
                    name: name,
                    category: AbstractBroker_1.MessagingCategories[3]
                },
                data: {
                    status: status
                }
            };
            _this.sendMessage(message);
        };
    };
    MessageBroker.prototype.sendMessage = function (message) {
        this.target.makeMessage(message);
    };
    MessageBroker.prototype.attachTarget = function (target) {
        var _this = this;
        if (this.target) {
            this.disposeTarget();
        }
        this.target = target;
        target.onmessage = function (message) { _this.messageHandler(message); };
        target.onerror = function (e) { return _this.ErrorProducer.trigger(e); };
        target.ondeadletter = function (letter) { return _this.DeadLetterProducer.trigger(letter); };
        this.fireLifeCycleEvent(AbstractBroker_1.LifeCycleEvents[0]);
    };
    MessageBroker.prototype.disposeTarget = function () {
        this.target.dispose();
        this.target = null;
        this.fireLifeCycleEvent(AbstractBroker_1.LifeCycleEvents[1]);
    };
    MessageBroker.prototype.findProducers = function (name) {
        var broker;
        var i = 0;
        for (i = 0; i < this.MessageProducers.length; i += 1) {
            if (this.MessageProducers[i].name === name) {
                broker = this.MessageProducers[i];
                break;
            }
        }
        return broker;
    };
    MessageBroker.prototype.fireLifeCycleEvent = function (status) {
        this.LifeCycleProducer.trigger(status);
    };
    MessageBroker.prototype.attachLifeCycle = function () {
        return xstream_1.Stream.create(this.LifeCycleProducer);
    };
    MessageBroker.prototype.attachMessage = function (name) {
        var producer = this.findProducers(name);
        if (!producer) {
            producer = { producer: new NotifyProducer(), name: name };
            this.MessageProducers.push(producer);
        }
        return xstream_1.Stream.create(producer.producer);
    };
    MessageBroker.prototype.attachDeadLetter = function () {
        return xstream_1.Stream.create(this.DeadLetterProducer);
    };
    MessageBroker.prototype.attachError = function () {
        return xstream_1.Stream.create(this.ErrorProducer);
    };
    return MessageBroker;
}());
exports.MessageBroker = MessageBroker;
