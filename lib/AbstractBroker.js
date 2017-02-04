"use strict";
var MessagingTypes;
(function (MessagingTypes) {
    MessagingTypes[MessagingTypes["message"] = 0] = "message";
    MessagingTypes[MessagingTypes["publish"] = 1] = "publish";
    MessagingTypes[MessagingTypes["subscribe"] = 2] = "subscribe";
    MessagingTypes[MessagingTypes["broker"] = 3] = "broker";
})(MessagingTypes = exports.MessagingTypes || (exports.MessagingTypes = {}));
var MessagingCategories;
(function (MessagingCategories) {
    MessagingCategories[MessagingCategories["data"] = 0] = "data";
    MessagingCategories[MessagingCategories["progress"] = 1] = "progress";
    MessagingCategories[MessagingCategories["cancel"] = 2] = "cancel";
    MessagingCategories[MessagingCategories["error"] = 3] = "error";
    MessagingCategories[MessagingCategories["progressCallback"] = 4] = "progressCallback";
    MessagingCategories[MessagingCategories["cancelCallback"] = 5] = "cancelCallback";
    MessagingCategories[MessagingCategories["attach"] = 6] = "attach";
    MessagingCategories[MessagingCategories["dispose"] = 7] = "dispose";
})(MessagingCategories = exports.MessagingCategories || (exports.MessagingCategories = {}));
var LifeCycleEvents;
(function (LifeCycleEvents) {
    LifeCycleEvents[LifeCycleEvents["initialized"] = 0] = "initialized";
    LifeCycleEvents[LifeCycleEvents["disposed"] = 1] = "disposed";
})(LifeCycleEvents = exports.LifeCycleEvents || (exports.LifeCycleEvents = {}));
var AbstractMessageProducer = (function () {
    function AbstractMessageProducer() {
    }
    return AbstractMessageProducer;
}());
exports.AbstractMessageProducer = AbstractMessageProducer;
