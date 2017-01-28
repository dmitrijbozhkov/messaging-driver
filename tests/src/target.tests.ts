import * as assert from "assert";
import {WorkerTarget} from "../../lib/MessageTargets";
import {WorkerMock, MessageEventMock, ErrorEventMock} from "../../lib/WorkerMock";
import {IBrokerMessage, MessagingTypes, MessagingCategories} from "../../lib/AbstractBroker";
describe("WorkerTarget tests", () => {
    let worker: WorkerMock;
    let workerTarget: WorkerTarget;
    let data = "data";
    beforeEach(() => {
        worker = new WorkerMock("path");
        workerTarget = new WorkerTarget(worker);
    });
    it("WorkerTarget.onmessage() should be called when woker posts message", () => {
         let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[0],
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        let evt = new MessageEventMock("message", {data: message});
        workerTarget.onmessage = (message: MessageEvent) => assert.deepEqual(message.data.message.data, data);
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
        worker.onposted = (e: any) => assert.deepEqual(e.data, data);
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                bare: true
            },
            message: {
                data: data
            }
        };
        workerTarget.makeMessage(message);
    });
    it("WorkerTarget.makeMessage() should throw exception if publish type specified", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[3],
                name: "TestPromise",
                bare: true
            },
            message: {
                data: data
            }
        };
        assert.throws(() => {
            workerTarget.makeMessage(message);
        });
    });
    it("WorkerTarget.makePublish() should post publish to worker", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[3],
                name: "TestRequest",
                category: MessagingCategories[0],
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        worker.onposted = (e: MessageEvent, ports: MessagePort[]) => assert.deepEqual(e.data.message.data, data);
        workerTarget.makePublish(message, "kek" as any);
    });
    it("WorkerTarget.makePublish() should throw exception if promise, request or response", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestRequest",
                category: MessagingCategories[0],
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        assert.throws(() => {
            workerTarget.makePublish(message, "kek" as any);
        });
    });
});