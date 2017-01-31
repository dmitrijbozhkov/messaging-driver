import * as assert from "assert";
import {WorkerTarget, TargetRoute, PortTarget} from "../../lib/MessageTargets";
import {WorkerMock, MessageEventMock, ErrorEventMock} from "../../lib/WorkerMock";
import {IBrokerMessage, MessagingTypes, MessagingCategories, IPublishMessage} from "../../lib/AbstractBroker";
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
    it("route() should route publish messages to onpublish", () => {
        let channel = new MessageChannel();
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise",
                category: MessagingCategories[0]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message, ports: [channel.port1]});
        router.onpublish = (message: IBrokerMessage, port: MessagePort) => {
            assert.deepEqual(message.data, data);
            assert.deepEqual(port, channel.port1);
        };
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
        workerTarget.onerror = (e: ErrorEvent) => assert.deepEqual(e.message, errEvent.message);
        worker.dispatchEvent(errEvent as any);
    });
    it("makeMessage() should post message to worker", () => {
        worker.onposted = (e: any) => assert.deepEqual(e.data.data, data);
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise"
            },
            data: data
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
    it("makePublish() should post publish to worker", () => {
        let port = new MessageChannel().port1;
        let message: IPublishMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestRequest",
                category: MessagingCategories[0]
            },
            data: data,
            port: port
        };
        worker.onposted = (e: MessageEvent, ports: MessagePort[]) => {
            assert.deepEqual(e.data.data, data);
            assert.deepEqual(ports[0], port);
        };
        workerTarget.makePublish(message);
    });
    it("makePublish() should post all that is in message.data and add port to ports if bare is true", () => {
        let port = new MessageChannel().port1;
        let message: IPublishMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise",
                category: MessagingCategories[0],
                bare: true
            },
            data: data,
            port: port
        };
        worker.onposted = (e: MessageEvent, ports: MessagePort[]) => {
            assert.deepEqual(e.data, data);
            assert.deepEqual(ports[0], port);
        };
        workerTarget.makePublish(message);
    });
    it("makePublish() should throw exception if envelope.type equal to message", () => {
        let port = new MessageChannel().port1;
        let message: IPublishMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestRequest",
                category: MessagingCategories[0]
            },
            data: data,
            port: port
        };
        assert.throws(() => {
            workerTarget.makePublish(message);
        });
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
    it("makePublish() should post publish to port", () => {
        let port = new MessageChannel().port1;
        let message: IPublishMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestRequest",
                category: MessagingCategories[0]
            },
            data: data,
            port: port
        };
        channel.port2.onmessage = (e: MessageEvent) => {
            assert.deepEqual(e.data.data, data);
            assert.deepEqual(e.ports[0], port);
        };
        portTarget.makePublish(message);
    });
    it("makePublish() should post all that is in message.data and add port to ports if bare is true", () => {
        let port = new MessageChannel().port1;
        let message: IPublishMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise",
                category: MessagingCategories[0],
                bare: true
            },
            data: data,
            port: port
        };
        channel.port2.onmessage = (e: MessageEvent) => {
            assert.deepEqual(e.data, data);
            assert.deepEqual(e.ports[0], port);
        };
        portTarget.makePublish(message);
    });
    it("makePublish() should throw exception if envelope.type equal to message", () => {
        let port = new MessageChannel().port1;
        let message: IPublishMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestRequest",
                category: MessagingCategories[0]
            },
            data: data,
            port: port
        };
        assert.throws(() => {
            portTarget.makePublish(message);
        });
    });
});