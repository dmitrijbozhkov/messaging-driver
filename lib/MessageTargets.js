"use strict";
var AbstractBroker_1 = require("./AbstractBroker");
var TargetRoute = (function () {
    function TargetRoute() {
    }
    TargetRoute.prototype.checkIsDeadLetter = function (message) {
        return typeof message.envelope === "undefined" || typeof message.data === "undefined";
    };
    TargetRoute.prototype.checkBadEnvelope = function (envelope) {
        return typeof envelope.name === "undefined" || typeof envelope.category === "undefined" || typeof envelope.type === "undefined";
    };
    TargetRoute.prototype.route = function (event) {
        if (this.checkIsDeadLetter(event.data)) {
            this.ondeadletter(event);
        }
        else {
            if (this.checkBadEnvelope(event.data.envelope)) {
                this.ondeadletter(event);
            }
            else {
                this.filter(event);
            }
        }
    };
    TargetRoute.prototype.filter = function (message) {
        switch (message.data.envelope.type) {
            case AbstractBroker_1.MessagingTypes[0]:
                this.onmessage(message.data);
                break;
            case AbstractBroker_1.MessagingTypes[1]:
                this.onpublish(message.data, message.ports[0]);
                break;
            default:
                this.ondeadletter(message);
        }
    };
    return TargetRoute;
}());
exports.TargetRoute = TargetRoute;
var WorkerTarget = (function () {
    function WorkerTarget(worker, router) {
        var _this = this;
        this.worker = worker;
        this.router = router;
        this.router.onmessage = function (message) { _this.onmessage(message); };
        this.router.onpublish = function (publish, port) { _this.onpublish(publish, port); };
        this.router.ondeadletter = function (letter) { _this.ondeadletter(letter); };
        this.router.onerror = function (e) { return _this.onerror(e); };
        this.worker.onmessage = function (e) { _this.router.route(e); };
        this.worker.onerror = function (e) { return _this.onerror(e); };
    }
    WorkerTarget.prototype.checkIsMessage = function (type) {
        return type === AbstractBroker_1.MessagingTypes[0];
    };
    WorkerTarget.prototype.makeMessage = function (message) {
        if (this.checkIsMessage(message.envelope.type)) {
            if (message.envelope.bare) {
                this.worker.postMessage(message.data);
            }
            else {
                this.worker.postMessage(message);
            }
        }
        else {
            throw new Error("Wrong message type");
        }
    };
    WorkerTarget.prototype.makePublish = function (message) {
        var port = message.port;
        delete message.port;
        if (message.envelope.type === AbstractBroker_1.MessagingTypes[1]) {
            if (message.envelope.bare) {
                this.worker.postMessage(message.data, [port]);
            }
            else {
                this.worker.postMessage(message, [port]);
            }
        }
        else {
            throw new Error("Wrong message type");
        }
    };
    WorkerTarget.prototype.dispose = function () {
        this.worker.terminate();
    };
    return WorkerTarget;
}());
exports.WorkerTarget = WorkerTarget;
var PortTarget = (function () {
    function PortTarget(port, router) {
        var _this = this;
        this.port = port;
        this.router = router;
        this.router.onmessage = function (message) { _this.onmessage(message); };
        this.router.onpublish = function (publish, port) { return _this.onpublish(publish, port); };
        this.router.ondeadletter = function (data) { return _this.ondeadletter(data); };
        this.port.onmessage = function (e) { _this.router.route(e); };
    }
    PortTarget.prototype.checkIsMessage = function (type) {
        return type === AbstractBroker_1.MessagingTypes[0];
    };
    PortTarget.prototype.makeMessage = function (message) {
        if (this.checkIsMessage(message.envelope.type)) {
            if (message.envelope.bare) {
                this.port.postMessage(message.data);
            }
            else {
                this.port.postMessage(message);
            }
        }
        else {
            throw new Error("Wrong message type");
        }
    };
    PortTarget.prototype.makePublish = function (message) {
        var port = message.port;
        delete message.port;
        if (message.envelope.type === AbstractBroker_1.MessagingTypes[1]) {
            if (message.envelope.bare) {
                this.port.postMessage(message.data, [port]);
            }
            else {
                this.port.postMessage(message, [port]);
            }
        }
        else {
            throw new Error("Wrong message type");
        }
    };
    PortTarget.prototype.dispose = function () { };
    return PortTarget;
}());
exports.PortTarget = PortTarget;
var FrameTarget = (function () {
    function FrameTarget(frame, router) {
        var _this = this;
        this.frame = frame;
        this.router = router;
        this.frame.onmessage = function (message) { _this.router.route(message); };
        this.frame.onerror = function (msg, url, line, col, error) { _this.onerror({ message: msg, filename: url, lineno: line, colno: col, error: error }); };
        this.router.onmessage = function (message) { _this.onmessage(message); };
        this.router.onpublish = function (publish, port) { return _this.onpublish(publish, port); };
        this.router.ondeadletter = function (data) { return _this.ondeadletter(data); };
        this.router.onerror = function (e) { return _this.onerror(e); };
    }
    FrameTarget.prototype.checkIsMessage = function (type) {
        return type === AbstractBroker_1.MessagingTypes[0];
    };
    FrameTarget.prototype.makeMessage = function (message) {
        if (this.checkIsMessage(message.envelope.type)) {
            if (message.envelope.origin) {
                if (message.envelope.bare) {
                    this.frame.postMessage(message.data, message.envelope.origin);
                }
                else {
                    this.frame.postMessage(message, message.envelope.origin);
                }
            }
            else {
                throw new Error("No targetOrigin specified");
            }
        }
        else {
            throw new Error("Wrong message type");
        }
    };
    FrameTarget.prototype.makePublish = function (message) {
        var port = message.port;
        delete message.port;
        if (message.envelope.type === AbstractBroker_1.MessagingTypes[1]) {
            if (message.envelope.origin) {
                if (message.envelope.bare) {
                    this.frame.postMessage(message.data, message.envelope.origin, [port]);
                }
                else {
                    this.frame.postMessage(message, message.envelope.origin, [port]);
                }
            }
            else {
                throw new Error("No targetOrigin specified");
            }
        }
        else {
            throw new Error("Wrong message type");
        }
    };
    FrameTarget.prototype.dispose = function () { };
    return FrameTarget;
}());
exports.FrameTarget = FrameTarget;