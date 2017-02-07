"use strict";
var AbstractBroker_1 = require("./AbstractBroker");
var xstream_1 = require("xstream");
var MessageTargets_1 = require("./MessageTargets");
var NotifyProducer = (function () {
    function NotifyProducer() {
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
var MessageBroker = (function () {
    function MessageBroker() {
        this.MessageProducers = [];
        this.PortBrokers = [];
        this.ErrorProducer = new NotifyProducer();
        this.DeadLetterProducer = new NotifyProducer();
        this.LifeCycleProducer = new NotifyProducer();
    }
    MessageBroker.prototype.messageHandler = function (message) {
        if (message.envelope.category === AbstractBroker_1.MessagingCategories[1]) {
            message.progress = this.reportProgress(message.envelope.name);
        }
        else if (message.envelope.category === AbstractBroker_1.MessagingCategories[2]) {
            message.cancel = this.reportCancel(message.envelope.name);
        }
        this.MessageProducers.forEach(function (producer) {
            if (producer.name === message.envelope.name) {
                producer.producer.trigger(message);
            }
        });
    };
    MessageBroker.prototype.reportProgress = function (name) {
        var _this = this;
        return function (status) {
            var message = {
                envelope: {
                    type: AbstractBroker_1.MessagingTypes[0],
                    name: name,
                    category: AbstractBroker_1.MessagingCategories[4]
                },
                data: {
                    status: status
                }
            };
            _this.sendMessage(message);
        };
    };
    MessageBroker.prototype.reportCancel = function (name) {
        var _this = this;
        return function (status) {
            var message = {
                envelope: {
                    type: AbstractBroker_1.MessagingTypes[0],
                    name: name,
                    category: AbstractBroker_1.MessagingCategories[5]
                },
                data: {
                    status: status
                }
            };
            _this.sendMessage(message);
        };
    };
    MessageBroker.prototype.sendMessage = function (message) {
        if (!message.envelope.target) {
            this.target.makeMessage(message);
        }
        else if (!message.envelope.target.length) {
            this.target.makeMessage(message);
        }
        else {
            var name_1 = message.envelope.target.splice(0, 1);
            var broker = this.findBroker(name_1[0]);
            if (broker) {
                broker.broker.sendMessage(message);
            }
            else {
                throw new Error("No such broker");
            }
        }
    };
    MessageBroker.prototype.sendPublish = function (publish) {
        if (!publish.envelope.target) {
            this.target.makePublish(publish);
        }
        else if (!publish.envelope.target.length) {
            this.target.makePublish(publish);
        }
        else {
            var name_2 = publish.envelope.target.splice(0, 1);
            var broker = this.findBroker(name_2[0]);
            if (broker) {
                broker.broker.sendPublish(publish);
            }
            else {
                throw new Error("No such broker");
            }
        }
    };
    MessageBroker.prototype.findBroker = function (name) {
        var broker;
        var i = 0;
        for (i = 0; i < this.PortBrokers.length; i += 1) {
            if (this.PortBrokers[i].name === name) {
                broker = this.PortBrokers[i];
                break;
            }
        }
        return broker;
    };
    MessageBroker.prototype.publishHandler = function (publish, port) {
        if (!publish.envelope.name) {
            throw new Error("Name is empty");
        }
        if (publish.port) {
            delete publish.port;
        }
        var portTarget = new MessageTargets_1.PortTarget(port, new MessageTargets_1.TargetRoute());
        var broker = this.findBroker(publish.envelope.name);
        if (!broker) {
            broker = { broker: new MessageBroker(), name: publish.envelope.name };
            this.PortBrokers.push(broker);
        }
        broker.broker.attachTarget(portTarget);
    };
    MessageBroker.prototype.subscribeHandler = function (name) {
        if (!name) {
            throw new Error("Name is empty");
        }
        var portBroker = this.findBroker(name);
        if (!portBroker) {
            portBroker = { broker: new MessageBroker(), name: name };
            this.PortBrokers.push(portBroker);
        }
        return portBroker.broker;
    };
    MessageBroker.prototype.attachTarget = function (target) {
        var _this = this;
        if (this.target) {
            this.disposeTarget();
        }
        this.target = target;
        target.onmessage = function (message) { _this.messageHandler(message); };
        target.onpublish = function (publish, port) { return _this.publishHandler(publish, port); };
        target.onerror = function (e) { return _this.ErrorProducer.trigger(e); };
        target.ondeadletter = function (letter) { return _this.DeadLetterProducer.trigger(letter); };
        this.fireLifeCycleEvent(AbstractBroker_1.LifeCycleEvents[0]);
    };
    MessageBroker.prototype.disposeTarget = function () {
        this.target.dispose();
        this.target = null;
        this.PortBrokers = [];
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
