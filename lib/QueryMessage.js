"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractBroker_1 = require("./AbstractBroker");
/*
export class ChooseBroker {
    private brokers: MessageBrokersSetup;
    constructor(listeners: MessageBrokersSetup) {
        this.brokers = listeners;
    }
    public Target(brokerName?: string) {
        if (!brokerName) {
            return new ChooseType(this.brokers["self"]);
        } else if (this.brokers[brokerName]) {
            return new ChooseType(this.brokers[brokerName]);
        } else {
            throw new Error("No such broker");
        }
    }
}
*/
var SubscribeChooseType = (function () {
    function SubscribeChooseType(listener) {
        this.context = listener;
    }
    SubscribeChooseType.prototype.Messages = function (name) {
        var stream = this.context.attachMessage(name);
        return new ChooseCategory(stream);
    };
    SubscribeChooseType.prototype.Subscribe = function (name) {
        var broker = this.context.subscribeHandler(name);
        return new SubscribeChooseType(broker);
    };
    SubscribeChooseType.prototype.DeadLetters = function () {
        var stream = this.context.attachDeadLetter();
        return stream;
    };
    SubscribeChooseType.prototype.LifeCycle = function () {
        var stream = this.context.attachLifeCycle();
        return stream;
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
        var stream = this.eContext.attachError();
        return stream;
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
    ChooseCategory.prototype.All = function () {
        return this.context;
    };
    return ChooseCategory;
}());
exports.ChooseCategory = ChooseCategory;
