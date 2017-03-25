import * as assert from "assert";
import {WorkerTarget, TargetRoute, PortTarget, FrameTarget} from "../../lib/MessageTargets";
import {WorkerMock, MessageEventMock, ErrorEventMock, FrameMock} from "../../lib/WorkerMock";
import {IBrokerMessage, MessagingTypes, MessagingCategories, IPortMessage} from "../../lib/AbstractBroker";
describe("TargetRoute tests", () => {
    let router: TargetRoute;
    let data = "data";
    beforeEach(() => {
        router = new TargetRoute();
    });
    it("route() should route message to onmessage", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[0]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        router.onmessage = (message: IBrokerMessage) => assert.deepEqual(message.data, data);
        router.route(evt as any);
    });
    it("route() should route messages without envelope to ondeadletter", () => {
        let message = {
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        router.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.data, message.data);
        router.route(evt as any);
    });
    it("route() should route messages without data to ondeadletter", () => {
        let message = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise",
                category: MessagingCategories[0]
            }
        };
        let evt = new MessageEventMock("message", {data: message});
        router.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.envelope, message.envelope);
        router.route(evt as any);
    });
    it("route() should route messages without envelope.name to ondeadletter", () => {
        let message = {
            envelope: {
                type: MessagingTypes[1],
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: message});
        router.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.data, message.data);
        router.route(evt as any);
    });
    it("route() should route messages without envelope.category to ondeadletter", () => {
        let message = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise"
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: message});
        router.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.data, message.data);
        router.route(evt as any);
    });
    it("route() should route messages without envelope.type to ondeadletter", () => {
        let message = {
            envelope: {
                name: "TestPromise",
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: message});
        router.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.data, message.data);
        router.route(evt as any);
    });
    it("filter() should route messages with bad type to ondeadletter", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[2],
                name: "TestPromise",
                category: MessagingCategories[0]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        router.ondeadletter = (message: MessageEvent) => assert.deepEqual(message.data.data, data);
        router.route(evt as any);
    });
});
describe("WorkerTarget tests", () => {
    let worker: WorkerMock;
    let router: TargetRoute;
    let workerTarget: WorkerTarget;
    let data = "data";
    beforeEach(() => {
        worker = new WorkerMock("path");
        router = new TargetRoute();
        workerTarget = new WorkerTarget(worker, router);
    });
    it("onerror() should be called when error in worker occurred", () => {
        let errEvent: ErrorEventMock = {
            message: "TypeError",
            filename: "index.js",
            lineno: 13,
            colno: 18,
            type: "error"
        };
        workerTarget.onerror = (e: ErrorEvent) => { assert.deepEqual(e.message, errEvent.message); };
        worker.dispatchEvent(errEvent as any);
    });
    it("makeMessage() should post message to worker", () => {
        worker.onposted = (e: any) => { assert.deepEqual(e.data.data, data); };
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise"
            },
            data: data
        };
        workerTarget.makeMessage(message);
    });
    it("makeMessage() should post transferable list", () => {
        let trans = [new ArrayBuffer(64)];
        worker.onposted = (e: MessageEvent) => { assert.deepEqual(e.data.data, trans[0]); };
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise"
            },
            data: trans[0],
            transfer: trans
        };
        workerTarget.makeMessage(message);
    });
    it("makeMessage() should throw exception if publish type specified", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise"
            },
            data: data
        };
        assert.throws(() => {
            workerTarget.makeMessage(message);
        });
    });
    it("makeMessage() should throw exception if subscribe type specified", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[2],
                name: "TestPromise"
            },
            data: data
        };
        assert.throws(() => {
            workerTarget.makeMessage(message);
        });
    });
    it("makeMessage() should post all that is in message.data if bare is true", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[0],
                bare: true
            },
            data: data
        };
        worker.onposted = (message) => assert.deepEqual(message.data, data);
        workerTarget.makeMessage(message);
    });
});
describe("PortTarget tests", () => {
    let channel: MessageChannel;
    let router: TargetRoute;
    let portTarget: PortTarget;
    let data = "data";
    beforeEach(() => {
        channel = new MessageChannel();
        router = new TargetRoute();
        portTarget = new PortTarget(channel.port1, router);
    });
    it("makeMessage() should post message to port", () => {
        channel.port2.onmessage = (e: MessageEvent) => { assert.deepEqual(e.data.data, data); };
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise"
            },
            data: data
        };
        portTarget.makeMessage(message);
    });
    it("makeMessage() should post transferable list", () => {
        let trans = [new MessageChannel().port1];
        channel.port2.onmessage = (e: MessageEvent) => { assert.deepEqual(e.data.data, trans[0]); };
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise"
            },
            data: trans[0],
            transfer: trans
        };
        portTarget.makeMessage(message);
    });
    it("makeMessage() should throw exception if publish type specified", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise",
                category: MessagingCategories[0]
            },
            data: data
        };
        assert.throws(() => {
            portTarget.makeMessage(message);
        });
    });
    it("makeMessage() should throw exception if subscribe type specified", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[2],
                name: "TestPromise",
                category: MessagingCategories[0]
            },
            data: data
        };
        assert.throws(() => {
            portTarget.makeMessage(message);
        });
    });
    it("makeMessage() should post all that is in message.data if bare is true", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[0],
                bare: true
            },
            data: data
        };
        channel.port2.onmessage = (message: MessageEvent) => assert.deepEqual(message.data, data);
        portTarget.makeMessage(message);
    });
});
describe("FrameTarget tests", () => {
    let frame: FrameMock;
    let router: TargetRoute;
    let frameTarget: FrameTarget;
    let data = "data";
    beforeEach(() => {
        frame = new FrameMock();
        router = new TargetRoute();
        frameTarget = new FrameTarget(frame as any, router);
    });
    it("makeMessage() should post messages to frame", () => {
        frame.onposted = (m: MessageEvent) => assert.deepEqual(m.data.data, data);
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                origin: "www.google.com"
            },
            data: data
        };
        frameTarget.makeMessage(message);
    });
    it("makeMessage() should post transferable list", () => {
        let trans = [new ArrayBuffer(64)];
        frame.onposted = (e: MessageEvent) => { assert.deepEqual(e.data.data, trans[0]); };
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                origin: "www.google.com"
            },
            data: trans[0],
            transfer: trans
        };
        frameTarget.makeMessage(message);
    });
    it("makeMessage() should post all that is in message.data if bare is true", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[0],
                origin: "www.google.com",
                bare: true
            },
            data: data
        };
        frame.onposted = (e: MessageEvent) => assert.deepEqual(e.data, data);
        frameTarget.makeMessage(message);
    });
    it("makeMessage() should throw exception if publish type specified", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise",
                origin: "www.google.com"
            },
            data: data
        };
        assert.throws(() => {
            frameTarget.makeMessage(message);
        });
    });
    it("makeMessage() should throw exception if subscribe type specified", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                origin: "www.google.com",
                name: "TestPromise"
            },
            data: data
        };
        assert.throws(() => {
            frameTarget.makeMessage(message);
        });
    });
    it("makeMessage() should throw exception if no envelope.origin specified", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise"
            },
            data: data
        };
        assert.throws(() => {
            frameTarget.makeMessage(message);
        });
    });
});