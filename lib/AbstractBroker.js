"use strict";
/**
 * Types of messages that determine how message will be handled
 */
var MessagingTypes;
(function (MessagingTypes) {
    /** Just sends message to target */
    MessagingTypes[MessagingTypes["message"] = 0] = "message";
    /** MessageBroker target managing messages */
    MessagingTypes[MessagingTypes["broker"] = 1] = "broker";
})(MessagingTypes = exports.MessagingTypes || (exports.MessagingTypes = {}));
/**
 * Categories of messages that determine message routing
 */
var MessagingCategories;
(function (MessagingCategories) {
    /** Specifies that message just sending data */
    MessagingCategories[MessagingCategories["data"] = 0] = "data";
    /** Attaches notify callback to message */
    MessagingCategories[MessagingCategories["status"] = 1] = "status";
    /** Specifies the error type message */
    MessagingCategories[MessagingCategories["error"] = 2] = "error";
    /** Message from notify callback */
    MessagingCategories[MessagingCategories["statusCallback"] = 3] = "statusCallback";
    /** Message from cancel callback */
    MessagingCategories[MessagingCategories["attach"] = 4] = "attach";
    /** Disposes target of IBroker */
    MessagingCategories[MessagingCategories["dispose"] = 5] = "dispose";
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
