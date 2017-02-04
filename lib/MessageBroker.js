"use strict";
var AbstractBroker_1 = require("./AbstractBroker");
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
        this.ErrorProducers = [];
        this.DeadLetterProducers = [];
        this.LifeCycleProducers = [];
        this.PortBrokers = [];
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
        target.onerror = function (e) { return _this.ErrorProducers.forEach(function (producer) { return producer.trigger(e); }); };
        target.ondeadletter = function (letter) { return _this.DeadLetterProducers.forEach(function (producer) { return producer.trigger(letter); }); };
        this.fireLifeCycleEvent(AbstractBroker_1.LifeCycleEvents[0]);
    };
    MessageBroker.prototype.disposeTarget = function () {
        this.target.dispose();
        this.target = null;
        this.PortBrokers = [];
        this.fireLifeCycleEvent(AbstractBroker_1.LifeCycleEvents[1]);
    };
    MessageBroker.prototype.fireLifeCycleEvent = function (status) {
        this.LifeCycleProducers.forEach(function (producer) { return producer.trigger(status); });
    };
    MessageBroker.prototype.attachLifeCycle = function (producer) {
        this.LifeCycleProducers.push(producer);
        return producer;
    };
    MessageBroker.prototype.attachMessage = function (producer, name) {
        this.MessageProducers.push({ producer: producer, name: name });
        return producer;
    };
    MessageBroker.prototype.attachDeadLetter = function (producer) {
        this.DeadLetterProducers.push(producer);
        return producer;
    };
    MessageBroker.prototype.attachError = function (producer) {
        this.ErrorProducers.push(producer);
        return producer;
    };
    return MessageBroker;
}());
exports.MessageBroker = MessageBroker;
