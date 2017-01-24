import * as assert from "assert";
import {IBrokerMessage, MessagingTypes, MessagingCategories} from "../../lib/AbstractBroker";
import {WorkerBroker} from "../../lib/MessageBrokers";
import {WorkerMock, MessageEventMock, ErrorEventMock} from "../../lib/WorkerMock";

describe("Broker tests", () => {
    let worker: WorkerMock;
    let broker: WorkerBroker;
    let data = "data";
    beforeEach(() => {
        worker = new WorkerMock("path");
        broker = new WorkerBroker(worker);
    });
    it("WorkerBroker.makeMessage() should send promises", () => {
        worker.onposted = (e: MessageEvent) => {
            assert.deepEqual(e.data.message.data, data);
        };
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise"
            },
            message: {
                data: data
            }
        };
        broker.makeMessage(message);
    });
    it("WorkerBroker.makeMessaage() should make bare requests", () => {
        let data = "bare";
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
        broker.makeMessage(message);
    });
    it("WorerBroker.makeMessage() should send requests", () => {
        worker.onposted = (e: MessageEvent) => assert.deepEqual(e.data.message.data, data);
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: "TestPromise"
            },
            message: {
                data: data
            }
        };
        broker.makeMessage(message);
    });
    it("WorkerBroker.makeMessage() should throw exception if type is publish", () => {
        worker.onposted = (e: MessageEvent) => {};
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[3],
                name: "TestPromise",
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        assert.throws(() => {
            broker.makeMessage(message);
        });
    });
    it("WorkerBroker.makeMessage() should throw exception if type is subscribe", () => {
        worker.onposted = (e: MessageEvent) => {};
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[4],
                name: "TestPromise",
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        assert.throws(() => {
            broker.makeMessage(message);
        });
    });
    it("WorkerBroker.makeMessage() should throw exception if type is not one of MessagingTypes", () => {
        worker.onposted = (e: MessageEvent) => {};
        let message: IBrokerMessage = {
            envelope: {
                type: "stuff",
                name: "TestPromise",
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        assert.throws(() => {
            broker.makeMessage(message);
        });
    });
    it("WorkerBroker.makePublish() should make publish message", () => {
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
        broker.makePublish(message, "kek" as any);
    });
    it("WorkerBroker.makePublish() should make subscribe message", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[4],
                name: "TestRequest",
                category: MessagingCategories[0],
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        // worker.onposted = (e: MessageEvent, ports: MessagePort[]) => assert.deepEqual(e.data.message.data, data);
        assert.throws(() => {
            broker.makePublish(message, "kek" as any);
        });
    });
    it("WorkerBroker.makePublish() should throw exception if type is not one of MessagingTypes", () => {
        worker.onposted = (e: MessageEvent) => {};
        let message: IBrokerMessage = {
            envelope: {
                type: "stuff",
                name: "TestPromise",
                progress: false,
                cancel: false
            },
            message: {
                data: data
            }
        };
        assert.throws(() => {
            broker.makePublish(message, "kek" as any);
        });
    });
    it("WorkerBroker should route messages with message category to onmessage", () => {
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
        broker.onmessage = (message: IBrokerMessage, ports: MessagePort[]) => assert.deepEqual(message.message.data, data);
        worker.dispatchEvent(evt as any);
    });
    it("WorkerBroker should route messages with progress category to onprogress", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[1],
                progress: true,
                cancel: false
            },
            message: {
                data: data
            }
        };
        let evt = new MessageEventMock("message", {data: message});
        broker.onprogress = (message: IBrokerMessage) => assert.deepEqual(message.message.data, data);
        worker.dispatchEvent(evt as any);
    });
    it("WorkerBroker should route messages with cancel category to oncancel", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: MessagingCategories[2],
                progress: false,
                cancel: true
            },
            message: {
                data: data
            }
        };
        let evt = new MessageEventMock("message", {data: message});
        broker.oncancel = (message: IBrokerMessage) => assert.deepEqual(message.message.data, data);
        worker.dispatchEvent(evt as any);
    });
    it("WorkerBroker should route messages without category to onmessage", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise"
            },
            message: {
                data: data
            }
        };
        let evt = new MessageEventMock("message", {data: message});
        broker.onmessage = (message: IBrokerMessage) => assert.deepEqual(message.message.data, data);
        worker.dispatchEvent(evt as any);
    });
    it("WorkerBroker should call ondeadletter if message does not implement IBrokerMessage interfacce", () => {
        let message: any = {
            stuff: "something"
        };
        let evt = new MessageEventMock("message", {data: message});
        broker.ondeadletter = (letter: any) => assert.deepEqual(letter.stuff, message.stuff);
        worker.dispatchEvent(evt as any);
    });
    it("WorkerBroker should call ondeadletter if message category is not one of MessagingCategories", () => {
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "TestPromise",
                category: "wrong"
            },
            message: {
                data: data
            }
        };
        let channel = new MessageChannel();
        let evt = new MessageEventMock("message", {data: message, ports: [channel.port1]});
        broker.ondeadletter = (letter: any, ports: MessagePort[]) => assert.deepEqual(ports[0], channel.port1);
        worker.dispatchEvent(evt as any);
    });
    it("WorkerBroker should call onerror if error in worker occurred", () => {
        let errEvent: ErrorEventMock = {
            message: "TypeError",
            filename: "index.js",
            lineno: 13,
            colno: 18,
            type: "error"
        };
        broker.onerror = (e: ErrorEvent) => assert.deepEqual(e.message, errEvent.message);
        worker.dispatchEvent(errEvent as any);
    });
});