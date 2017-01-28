import * as assert from "assert";
import {WorkerTarget} from "../../lib/MessageTargets";
import {WorkerMock, MessageEventMock, ErrorEventMock} from "../../lib/WorkerMock";
import {IBrokerMessage, MessagingTypes, MessagingCategories, IPublishMessage} from "../../lib/AbstractBroker";
describe("WorkerTarget tests", () => {
    let worker: WorkerMock;
    let workerTarget: WorkerTarget;
    let data = "data";
    beforeEach(() => {
        worker = new WorkerMock("path");
        workerTarget = new WorkerTarget(worker);
    });
    it("WorkerTarget.onmessage() should be called when woker posts message with type message", () => {
         let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[0]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        workerTarget.onmessage = (message: IBrokerMessage) => assert.deepEqual(message.data, data);
        worker.dispatchEvent(evt as any);
    });
    it("WorkerTarget.onpublish() should be called when worker message has publish type", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise",
                category: MessagingCategories[0]
            },
            data: data
        };
        let port = new MessageChannel().port1;
        let evt = new MessageEventMock("message", {data: message, ports: [port]});
        workerTarget.onpublish = (message: IPublishMessage) => {
            assert.deepEqual(message.data, data);
            assert.deepEqual(message.port, port);
        };
        worker.dispatchEvent(evt as any);
    });
    it("Message without envelope should go to the ondeadletter", () => {
        let message = {
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        workerTarget.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.data, message.data);
        worker.dispatchEvent(evt as any);
    });
    it("Message without data should go to the ondeadletter", () => {
        let message = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise",
                category: MessagingCategories[0]
            }
        };
        let evt = new MessageEventMock("message", {data: message});
        workerTarget.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.envelope, message.envelope);
        worker.dispatchEvent(evt as any);
    });
    it("Message without envelope.type should go to ondeadletter", () => {
        let message = {
            envelope: {
                name: "TestPromise",
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: message});
        workerTarget.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.data, message.data);
        worker.dispatchEvent(evt as any);
    });
    it("Message without envelope.name should go to the ondeadletter", () => {
        let message = {
            envelope: {
                type: MessagingTypes[1],
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: message});
        workerTarget.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.data, message.data);
        worker.dispatchEvent(evt as any);
    });
    it("Message without envelope.category should go to onmessage", () => {
        let message = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise"
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: message});
        workerTarget.ondeadletter = (letter: MessageEvent) => assert.deepEqual(letter.data.data, message.data);
        worker.dispatchEvent(evt as any);
    });
    it("WorkerTarget.onerror() should be called when error in worker occurred", () => {
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
    it("WorkerTarget.ondeadletter() should be called if message don't have envelope or message", () => {
        let message = data;
        workerTarget.ondeadletter = (e: MessageEvent) => assert.deepEqual(e.data, message);
        let evt = new MessageEventMock("message", {data: message});
        worker.dispatchEvent(evt as any);
    });
    it("WorkerTarget.makeMessage() should post message to worker", () => {
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
    it("WorkerTarget.makeMessage() should throw exception if publish type specified", () => {
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
    it("WorkerTarget.makeMessage() should throw exception if subscribe type specified", () => {
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
    it("WorkerTarget.makeMessage() should post all that is in message.data if bare is true", () => {
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
    it("WorkerTarget.makePublish() should post publish to worker", () => {
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
        worker.onposted = (e: MessageEvent, ports) => {
            assert.deepEqual(e.data.data, data);
            assert.deepEqual(ports[0], port);
        };
        workerTarget.makePublish(message);
    });
    it("WorkerTarget.makePublish() should post all that is in message.data and add port to ports if bare is true", () => {
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
    it("WorkerTarget.makePublish() should throw exception if envelope.type equal to message", () => {
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