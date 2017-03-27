"use strict";
var AbstractBroker_1 = require("./AbstractBroker");
/**
 * Class for querying target messages
 * @constructor Takes target broker
 */
var ChooseType = (function () {
    function ChooseType(listener) {
        this.context = listener;
    }
    /**
     * Queries error events of the target
     * @returns Returns stream of ErrorEvents
     */
    ChooseType.prototype.Errors = function () {
        var stream = this.context.attachError();
        return stream;
    };
    /**
     * Queries messages with specified name
     * @param name Name of the messages
     * @returns Returns class which queries category of the message
     */
    ChooseType.prototype.Messages = function (name) {
        var stream = this.context.attachMessage(name);
        return new ChooseCategory(stream);
    };
    /**
     * Queries DeadLetters of the target
     * @returns Stream of DeadLetters
     */
    ChooseType.prototype.DeadLetters = function () {
        var stream = this.context.attachDeadLetter();
        return stream;
    };
    /**
     * Queries LifeCycle events of target
     * @returns Stream of lifecycle events
     */
    ChooseType.prototype.LifeCycle = function () {
        var stream = this.context.attachLifeCycle();
        return stream;
    };
    return ChooseType;
}());
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
        return this.context.filter(takeMessages);
    };
    /**
     * Queries messages with progress callback
     * @returns Returns stream of messages with progress callback
    */
    ChooseCategory.prototype.Status = function () {
        return this.context.filter(function (m) { return m.envelope.category === AbstractBroker_1.MessagingCategories[3]; });
    };
    /**
     * Queries all messages
     * @returns Returns stream of messages
     */
    ChooseCategory.prototype.All = function () {
        return this.context;
    };
    return ChooseCategory;
}());
exports.ChooseCategory = ChooseCategory;
