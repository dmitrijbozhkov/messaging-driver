"use strict";
var MessageEventMock = (function () {
    function MessageEventMock(type, params) {
        this.type = type;
        this.data = params.data;
        this.bubbles = params.bubbles;
        this.cancelable = params.cancelable;
        this.lastEventId = params.lastEventId;
        this.origin = params.origin;
        this.ports = params.ports;
        this.source = params.source;
    }
    return MessageEventMock;
}());
exports.MessageEventMock = MessageEventMock;
var ErrorEventMock = (function () {
    function ErrorEventMock() {
    }
    return ErrorEventMock;
}());
exports.ErrorEventMock = ErrorEventMock;
var WorkerMock = (function () {
    function WorkerMock(path) {
        this.terminated = false;
        this.path = path;
    }
    WorkerMock.prototype.addEventListener = function (type, handler) {
        this.listeners.push(handler);
    };
    WorkerMock.prototype.removeEventListener = function (type, handler) {
        var removeIndex = this.listeners.indexOf(handler);
        this.listeners.splice(removeIndex, removeIndex + 1);
    };
    WorkerMock.prototype.dispatchEvent = function (e) {
        var prevent = true;
        if (e.type === "message") {
            this.onmessage(e);
        }
        else if (e.type === "error") {
            this.onerror(e);
        }
        if (this.listeners) {
            this.listeners
                .filter(function (listener) { return listener.type === typeof e; })
                .forEach(function (listener) {
                var preventDefault = listener.listener(e);
                if (preventDefault === false) {
                    prevent = true;
                }
            });
        }
        return prevent;
    };
    WorkerMock.prototype.postMessage = function (message, ports) {
        if (typeof ports === "undefined") {
            ports = [];
        }
        this.onposted({ data: message }, ports);
    };
    WorkerMock.prototype.terminate = function () {
        this.terminated = true;
    };
    return WorkerMock;
}());
exports.WorkerMock = WorkerMock;
var FrameMock = (function () {
    function FrameMock() {
        this.terminated = false;
    }
    FrameMock.prototype.addEventListener = function (type, handler) {
        this.listeners.push(handler);
    };
    FrameMock.prototype.removeEventListener = function (type, handler) {
        var removeIndex = this.listeners.indexOf(handler);
        this.listeners.splice(removeIndex, removeIndex + 1);
    };
    FrameMock.prototype.dispatchEvent = function (e) {
        var prevent = true;
        if (e.type === "message") {
            this.onmessage(e);
        }
        else if (e.type === "error") {
            this.onerror(e);
        }
        if (this.listeners) {
            this.listeners
                .filter(function (listener) { return listener.type === typeof e; })
                .forEach(function (listener) {
                var preventDefault = listener.listener(e);
                if (preventDefault === false) {
                    prevent = true;
                }
            });
        }
        return prevent;
    };
    FrameMock.prototype.postMessage = function (message, origin, ports) {
        if (typeof ports === "undefined") {
            ports = [];
        }
        this.onposted({ data: message, origin: origin }, ports);
    };
    FrameMock.prototype.terminate = function () {
        this.terminated = true;
    };
    return FrameMock;
}());
exports.FrameMock = FrameMock;
