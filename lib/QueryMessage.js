"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xstream_1 = require("xstream");
var MessageBroker_1 = require("./MessageBroker");
var AbstractBroker_1 = require("./AbstractBroker");
var ChooseBroker = (function () {
    function ChooseBroker(listeners) {
        this.brokers = listeners;
    }
    ChooseBroker.prototype.Target = function (brokerName) {
        if (!brokerName) {
            return new ChooseType(this.brokers["self"]);
        }
        else if (this.brokers[brokerName]) {
            return new ChooseType(this.brokers[brokerName]);
        }
        else {
            throw new Error("No such broker");
        }
    };
    return ChooseBroker;
}());
exports.ChooseBroker = ChooseBroker;
var SubscribeChooseType = (function () {
    function SubscribeChooseType(listener) {
        this.context = listener;
    }
    SubscribeChooseType.prototype.Messages = function (name) {
        var producer = this.context.attachMessage(new MessageBroker_1.NotifyProducer(), name);
        var stream = xstream_1.Stream.create(producer);
        return new ChooseCategory(stream);
    };
    SubscribeChooseType.prototype.Subscribe = function (name) {
        var broker = this.context.subscribeHandler(name);
        return new SubscribeChooseType(broker);
    };
    SubscribeChooseType.prototype.DeadLetters = function () {
        var producer = this.context.attachDeadLetter(new MessageBroker_1.NotifyProducer());
        return xstream_1.Stream.create(producer);
    };
    SubscribeChooseType.prototype.LifeCycle = function () {
        var producer = this.context.attachLifeCycle(new MessageBroker_1.NotifyProducer());
        return xstream_1.Stream.create(producer);
    };
    return SubscribeChooseType;
}());
exports.SubscribeChooseType = SubscribeChooseType;
var ChooseType = (function (_super) {
    __extends(ChooseType, _super);
    function ChooseType(listener) {
        var _this = _super.call(this, listener) || this;
        _this.eContext = listener;
        return _this;
    }
    ChooseType.prototype.Errors = function () {
        var producer = this.eContext.attachError(new MessageBroker_1.NotifyProducer());
        return xstream_1.Stream.create(producer);
    };
    return ChooseType;
}(SubscribeChooseType));
exports.ChooseType = ChooseType;
var ChooseCategory = (function () {
    function ChooseCategory(context) {
        this.context = context;
    }
    ChooseCategory.prototype.Data = function () {
        var takeMessages = function (m) {
            var c = m.envelope.category;
            return c === AbstractBroker_1.MessagingCategories[0] || c === AbstractBroker_1.MessagingCategories[1] || c === AbstractBroker_1.MessagingCategories[2] || c === AbstractBroker_1.MessagingCategories[3];
        };
        return this.context.filter(takeMessages);
    };
    ChooseCategory.prototype.Progress = function () {
        return this.context.filter(function (m) { return m.envelope.category === AbstractBroker_1.MessagingCategories[4]; });
    };
    ChooseCategory.prototype.Cancel = function () {
        return this.context.filter(function (m) { return m.envelope.category === AbstractBroker_1.MessagingCategories[5]; });
    };
    return ChooseCategory;
}());
exports.ChooseCategory = ChooseCategory;
