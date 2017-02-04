"use strict";
var QueryMessage_1 = require("./QueryMessage");
var SinkRouter_1 = require("./SinkRouter");
function makeMessagingDriver(brokers) {
    return function (source) {
        var routeSink = new SinkRouter_1.SinkRouter(brokers);
        source.addListener(routeSink);
        return new QueryMessage_1.ChooseBroker(brokers);
    };
}
exports.makeMessagingDriver = makeMessagingDriver;
