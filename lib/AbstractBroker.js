"use strict";
/**
 * Types of messages that determine how message will be handled
 */
var MessagingTypes;
(function (MessagingTypes) {
    /** Just sends message to target */
    MessagingTypes[MessagingTypes["message"] = 0] = "message";
    /** Publishes port to target */
    MessagingTypes[MessagingTypes["publish"] = 1] = "publish";
    /** Subscribes to port */
    MessagingTypes[MessagingTypes["subscribe"] = 2] = "subscribe";
    /** MessageBroker target managing messages */
    MessagingTypes[MessagingTypes["broker"] = 3] = "broker";
})(MessagingTypes = exports.MessagingTypes || (exports.MessagingTypes = {}));
/**
 * Categories of messages that determine message routing
 */
var MessagingCategories;
(function (MessagingCategories) {
    /** Specifies that message just sending data */
    MessagingCategories[MessagingCategories["data"] = 0] = "data";
    /** Attaches progress callback to message */
    MessagingCategories[MessagingCategories["progress"] = 1] = "progress";
    /** Attaches cancel callback to message */
    MessagingCategories[MessagingCategories["cancel"] = 2] = "cancel";
    /** Specifies the error type message */
    MessagingCategories[MessagingCategories["error"] = 3] = "error";
    /** Message from progress callback */
    MessagingCategories[MessagingCategories["progressCallback"] = 4] = "progressCallback";
    /** Message from cancel callback */
    MessagingCategories[MessagingCategories["cancelCallback"] = 5] = "cancelCallback";
    /** Attaches target to IBroker */
    MessagingCategories[MessagingCategories["attach"] = 6] = "attach";
    /** Disposes target of IBroker */
    MessagingCategories[MessagingCategories["dispose"] = 7] = "dispose";
})(MessagingCategories = exports.MessagingCategories || (exports.MessagingCategories = {}));
/**
 * Actions from IBroker target
 */
var LifeCycleEvents;
(function (LifeCycleEvents) {
    /** Attached new target */
    LifeCycleEvents[LifeCycleEvents["initialized"] = 0] = "initialized";
    /** Target disposed */
    LifeCycleEvents[LifeCycleEvents["disposed"] = 1] = "disposed";
})(LifeCycleEvents = exports.LifeCycleEvents || (exports.LifeCycleEvents = {}));
/**
 * Abstract class that handles messages
 * @type T Message type
 */
var AbstractMessageProducer = (function () {
    function AbstractMessageProducer() {
    }
    return AbstractMessageProducer;
}());
exports.AbstractMessageProducer = AbstractMessageProducer;
