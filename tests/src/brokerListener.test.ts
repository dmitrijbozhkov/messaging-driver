import * as assert from "assert";
import {WorkerMock, MessageEventMock, ErrorEventMock} from "../../lib/WorkerMock";
import {WorkerBroker} from "../../lib/MessageBrokers";
import {BrokerListener, ChooseBroker, ChooseMessage, ChooseMethod} from "../../lib/MessageListeners";
import {IBrokerMessage, MessagingTypes, MessagingCategories} from "../../lib/AbstractBroker";

describe("BrokerListener tests", () => {
    let worker: WorkerMock;
    let broker: WorkerBroker;
    let brokerListener: BrokerListener;
    beforeEach(() => {
        worker = new WorkerMock("path");
        broker = new WorkerBroker(worker);
        brokerListener = new BrokerListener(broker);
    });
    it("All callbacks that were pushed by addMessageListener() should be fired if worker posted message", () => {
        let data = "data";
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
        let firstListen = (message: IBrokerMessage) => assert.deepEqual(message.message.data, data);
        let secondListen = (message: IBrokerMessage) => assert.deepEqual(message.message.data, data);
        brokerListener.addMessageListener("message", firstListen);
        brokerListener.addMessageListener("message", secondListen);
        worker.dispatchEvent(evt as any);
    });
    it("All callbacks that were pushed by addMessageListener() should be fired if worker posted progress", () => {
        let data = "data";
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[1],
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        let evt = new MessageEventMock("message", {data: message});
        let firstListen = (message: IBrokerMessage) => assert.deepEqual(message.message.data, data);
        let secondListen = (message: IBrokerMessage) => assert.deepEqual(message.message.data, data);
        brokerListener.addMessageListener("progress", firstListen);
        brokerListener.addMessageListener("progress", secondListen);
        worker.dispatchEvent(evt as any);
    });
    it("All callbacks that were pushed by addMessageListener() should be fired if worker posted cancel", () => {
        let data = "data";
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[2],
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        let evt = new MessageEventMock("message", {data: message});
        let firstListen = (message: IBrokerMessage) => assert.deepEqual(message.message.data, data);
        let secondListen = (message: IBrokerMessage) => assert.deepEqual(message.message.data, data);
        brokerListener.addMessageListener("cancel", firstListen);
        brokerListener.addMessageListener("cancel", secondListen);
        worker.dispatchEvent(evt as any);
    });
    it("All callbacks that were pushed by addMessageListener() should be fired if worker posted deadletter", () => {
        let data = "something";
        let message: any = {
            stuff: data
        };
        let evt = new MessageEventMock("message", {data: message});
        let firstListen = (message: any) => assert.deepEqual(message.stuff, data);
        let secondListen = (message: any) => assert.deepEqual(message.stuff, data);
        brokerListener.addMessageListener("deadletter", firstListen);
        brokerListener.addMessageListener("deadletter", secondListen);
        worker.dispatchEvent(evt as any);
    });
    it("All callbacks that were pushed by addMessageListener() should be fired if worker posted onerror", () => {
        let errEvent: ErrorEventMock = {
            message: "TypeError",
            filename: "index.js",
            lineno: 13,
            colno: 18,
            type: "error"
        };
        let firstListen = (message: any) => assert.deepEqual(message.type, "error");
        let secondListen = (message: any) => assert.deepEqual(message.type, "error");
        brokerListener.addMessageListener("error", firstListen);
        brokerListener.addMessageListener("error", secondListen);
        worker.dispatchEvent(errEvent as any);
    });
    it("AddMessageListener() should throw exception if wrong message type specified", () => {
        assert.throws(() => {
            brokerListener.addMessageListener("wrong", () => {console.log("do not call"); });
        });
    });
});
describe("ChooseBroker", () => {
    let worker: WorkerMock;
    let broker: WorkerBroker;
    let brokerListener: BrokerListener;
    let chooseBroker: ChooseBroker;
    beforeEach(() => {
        worker = new WorkerMock("path");
        broker = new WorkerBroker(worker);
        brokerListener = new BrokerListener(broker);
        chooseBroker = new ChooseBroker({path: brokerListener});
    });
    it("Target() method should return ChooseMethod class");
    it("Target() should choose global context if self is specified");
    it("Target() should choose global context if nothing is specified");
    it("Target() should throw error if wrong name is specified");
});