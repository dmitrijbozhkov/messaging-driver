"use strict";
var QueryMessage_1 = require("./QueryMessage");
var SinkRouter_1 = require("./SinkRouter");
function makeMessagingDriver(broker) {
    return function (source) {
        var routeSink = new SinkRouter_1.SinkRouter(broker);
        source.addListener(routeSink);
        return new QueryMessage_1.ChooseType(broker);
    };
}
exports.makeMessagingDriver = makeMessagingDriver;
