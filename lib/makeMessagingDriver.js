"use strict";
var QueryMessage_1 = require("./QueryMessage");
var SinkRouter_1 = require("./SinkRouter");
/**
 * Creates driver for messaging api
 * @param Broker that will operate target
 * @returns Function that gets stream of messages to send and returns message querying class ChooseType
 */
function makeMessagingDriver(broker) {
    return function (source, driverName) {
        var routeSink = new SinkRouter_1.SinkRouter(broker);
        try {
            source.addListener(routeSink);
        }
        catch (e) {
            source.subscribe(routeSink);
        }
        return new QueryMessage_1.ChooseType(broker);
    };
}
exports.makeMessagingDriver = makeMessagingDriver;
