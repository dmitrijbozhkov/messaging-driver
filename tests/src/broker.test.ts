import * as assert from "assert";
import {IBrokerMessage, MessagingTypes, MessagingCategories, IStatusMessage, LifeCycleEvents, IPortMessage} from "../../lib/AbstractBroker";
import {MessageBroker, NotifyProducer, IBroker} from "../../lib/MessageBroker";
import {WorkerMock, MessageEventMock, ErrorEventMock} from "../../lib/WorkerMock";
import {WorkerTarget, TargetRoute} from "../../lib/MessageTargets";
import {Stream} from "xstream";


describe("MessageBroker tests", () => {
    let worker: WorkerMock;
    let router: TargetRoute;
    let workerTarget: WorkerTarget;
    let broker: MessageBroker;
    let message: IBrokerMessage;
    beforeEach(() => {
        worker = new WorkerMock("path");
        router = new TargetRoute();
        workerTarget = new WorkerTarget(worker, router);
        broker = new MessageBroker();
        broker.attachTarget(workerTarget);
        message = {
            envelope: {
                type: MessagingTypes[0],
                name: "task",
                category: MessagingCategories[0]
            },
            data: "data"
        };
    });
    it("Messages with message type and 'task' name should be routed to message producers with name 'task' ", () => {
        let evt = new MessageEventMock("message", {data: message});
        let producer = broker.attachMessage("task");
        let event$ = producer.addListener({
            next: (letter: IBrokerMessage) => { assert.deepEqual(letter.data, "data"); },
            complete: () => {},
            error: () => {}
        });
        worker.dispatchEvent(evt as any);
    });
    it("Dead letters should trigger all deadletter producers", () => {
        delete message.envelope;
        let evt = new MessageEventMock("message", {data: message});
        let producer = broker.attachDeadLetter();
        let event$ = producer.addListener({
            next: (letter: MessageEvent) => { assert.deepEqual(letter.data.data, "data"); },
            complete: () => {},
            error: () => {}
        });
        worker.dispatchEvent(evt as any);
    });
    it("Errors should trigger all error error producers", () => {
        let errEvent: ErrorEventMock = {
            message: "TypeError",
            filename: "index.js",
            lineno: 13,
            colno: 18,
            type: "error"
        };
        let producer = broker.attachError();
        let event$ = producer.addListener({
            next: (err: ErrorEvent) => { assert.deepEqual(err.filename, errEvent.filename); },
            complete: () => {},
            error: () => {}
        });
        worker.dispatchEvent(errEvent as any);
    });
    it("Messages with category 'notify' should get a progress callback", () => {
        message.envelope.category = MessagingCategories[1];
        let evt = new MessageEventMock("message", {data: message});
        let producer = broker.attachMessage("task");
        let event$ = producer.addListener({
            next: (m: IStatusMessage) => { assert.deepEqual(typeof m.status, "function"); },
            complete: () => {},
            error: () => {}
        });
        worker.dispatchEvent(evt as any);
    });
    it("progress callback should post messages to target with category progressCallback", () => {
        message.envelope.category = MessagingCategories[1];
        let evt = new MessageEventMock("message", {data: message});
        let producer = broker.attachMessage("task");
        let event$ = producer.addListener({
            next: (m: IStatusMessage) => { m.status("proceding"); },
            complete: () => {},
            error: () => {}
        });
        worker.onposted = (e: MessageEvent, ports: MessagePort[]) => {
            assert.deepEqual(e.data.data.status, "proceding");
            assert.deepEqual(e.data.envelope.category, MessagingCategories[3]);
        };
        worker.dispatchEvent(evt as any);
    });
    it("sendMessage() should post message to target", () => {
        worker.onposted = (m: MessageEvent, ports: MessagePort[]) => assert.deepEqual(m.data.data, "data");
        broker.sendMessage(message as any);
    });
    it("sendMessage() should throw error if specified broker target not found", () => {
        (message.envelope as any).target = ["nope"];
        assert.throws(() => {
            broker.sendMessage(message as any);
        });
    });
    it("attachLifeCycle() should return producer which triggers on attachTarget() with message initialized", () => {
        let producer = broker.attachLifeCycle();
        broker.disposeTarget();
        let event$ = producer.addListener({
            next: (m: string) => { assert.deepEqual(m, LifeCycleEvents[0]); },
            complete: () => {},
            error: () => {}
        });
        broker.attachTarget(workerTarget);
    });
    it("attachLifeCycle() should return producer which triggers on dispose() with message disposed", () => {
        let producer = broker.attachLifeCycle();
        let event$ = producer.addListener({
            next: (m: string) => { assert.deepEqual(m, LifeCycleEvents[1]); },
            complete: () => {},
            error: () => {}
        });
        broker.disposeTarget();
    });
});