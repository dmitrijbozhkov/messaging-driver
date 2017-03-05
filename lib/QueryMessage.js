"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractBroker_1 = require("./AbstractBroker");
var adapt_1 = require("@cycle/run/lib/adapt");
/**
 * Class for querying messages from port broker
 * @constructor Takes port broker
 */
var SubscribeChooseType = (function () {
    function SubscribeChooseType(listener) {
        this.context = listener;
    }
    /**
     * Queries messages with specified name
     * @param name Name of the messages
     * @returns Returns class which queries category of the message
     */
    SubscribeChooseType.prototype.Messages = function (name) {
        var stream = this.context.attachMessage(name);
        return new ChooseCategory(stream);
    };
    /**
     * Queries port broker to listen to
     * @param name Name of the published port broker
     * @returns Class that queries the type of the message
     */
    SubscribeChooseType.prototype.Subscribe = function (name) {
        var broker = this.context.subscribeHandler(name);
        return new SubscribeChooseType(broker);
    };
    /**
     * Queries DeadLetters of the target
     * @returns Stream of DeadLetters
     */
    SubscribeChooseType.prototype.DeadLetters = function () {
        var stream = this.context.attachDeadLetter();
        return adapt_1.adapt(stream);
    };
    /**
     * Queries LifeCycle events of target
     * @returns Stream of lifecycle events
     */
    SubscribeChooseType.prototype.LifeCycle = function () {
        var stream = this.context.attachLifeCycle();
        return adapt_1.adapt(stream);
    };
    return SubscribeChooseType;
}());
exports.SubscribeChooseType = SubscribeChooseType;
/**
 * Class for querying target messages
 * @constructor Takes target broker
 */
var ChooseType = (function (_super) {
    __extends(ChooseType, _super);
    function ChooseType(listener) {
        var _this = _super.call(this, listener) || this;
        _this.eContext = listener;
        return _this;
    }
    /**
     * Queries error events of the target
     * @returns Returns stream of ErrorEvents
     */
    ChooseType.prototype.Errors = function () {
        var stream = this.eContext.attachError();
        return adapt_1.adapt(stream);
    };
    return ChooseType;
}(SubscribeChooseType));
exports.ChooseType = ChooseType;
/**
 * Class for querying category of the message
 * @constructor Takes stream of messages
 */
var ChooseCategory = (function () {
    function ChooseCategory(context) {
        this.context = context;
    }
    /**
     * Queries messages with data
     * @returns Returns stream of data messages
    */
    ChooseCategory.prototype.Data = function () {
        var takeMessages = function (m) {
            var c = m.envelope.category;
            return c === AbstractBroker_1.MessagingCategories[0] || c === AbstractBroker_1.MessagingCategories[1] || c === AbstractBroker_1.MessagingCategories[2] || c === AbstractBroker_1.MessagingCategories[3];
        };
        return adapt_1.adapt(this.context.filter(takeMessages));
    };
    /**
     * Queries messages with progress callback
     * @returns Returns stream of messages with progress callback
    */
    ChooseCategory.prototype.Status = function () {
        return adapt_1.adapt(this.context.filter(function (m) { return m.envelope.category === AbstractBroker_1.MessagingCategories[3]; }));
    };
    /**
     * Queries all messages
     * @returns Returns stream of messages
     */
    ChooseCategory.prototype.All = function () {
        return adapt_1.adapt(this.context);
    };
    return ChooseCategory;
}());
exports.ChooseCategory = ChooseCategory;
