import * as assert from "assert";
import { IBrokerMessage, MessagingTypes, MessagingCategories, LifeCycleEvents } from "../../lib/AbstractBroker";
import { makeMessagingDriver, MessageBrokersSetup } from "../../lib/makeMessagingDriver";
import { FrameTarget, WorkerTarget, PortTarget, TargetRoute } from "../../lib/MessageTargets";
import { FrameMock, WorkerMock, MessageEventMock, ErrorEventMock } from "../../lib/WorkerMock";
import { MessageBroker } from "../../lib/MessageBroker";
import { ChooseBroker, ChooseCategory, ChooseType, SubscribeChooseType } from "../../lib/QueryMessage";
import {Stream} from "xstream";
describe("makeMessagingDriver source tests", () => {
    let channel: MessageChannel;
    let frame: FrameMock;
    let worker: WorkerMock;
    let frameTarget: FrameTarget;
    let workerTarget: WorkerTarget;
    let portTarget: PortTarget;
    let brokers: MessageBrokersSetup;
    let source: ChooseBroker;
    beforeEach(() => {
        channel = new MessageChannel();
        frame = new FrameMock();
        worker = new WorkerMock("path");
        frameTarget = new FrameTarget(frame as any, new TargetRoute());
        workerTarget = new WorkerTarget(worker as any, new TargetRoute());
        portTarget = new PortTarget(channel.port1, new TargetRoute());
        brokers = {
            frame: new MessageBroker(),
            worker: new MessageBroker(),
            port: new MessageBroker()
        };
        source = new ChooseBroker(brokers);
    });
    it("source.Target() should return ChooseType", () => {
        let isChooseType = source.Target("frame") instanceof ChooseType;
        assert.ok(isChooseType);
    });
    it("source.Target().Messages() should return ChooseCategory", () => {
        let isChooseCategory = source.Target("worker").Messages("task") instanceof ChooseCategory;
        assert.ok(isChooseCategory);
    });
    it("source.Target().Messages().Data() should return stream of IBrokerMessage with category data", () => {
        let name = "task";
        let data = "data";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Messages(name).Data();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[0]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        worker.dispatchEvent(evt as any);
    });
    it("source.Target().Messages().Data() should return stream of IBrokerMessage with category progress", () => {
        let name = "task";
        let data = "data";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Messages(name).Data();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[1]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        worker.dispatchEvent(evt as any);
    });
    it("source.Target().Messages().Data() should return stream of IBrokerMessage with category cancel", () => {
        let name = "task";
        let data = "data";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Messages(name).Data();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[2]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        worker.dispatchEvent(evt as any);
    });
    it("source.Target().Messages().Data() should return stream of IBrokerMessage with category error", () => {
        let name = "task";
        let data = "data";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Messages(name).Data();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[3]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        worker.dispatchEvent(evt as any);
    });
    it("source.Target().Messages().Progress() should return stream of IBrokerMessage with category progressCallback", () => {
        let name = "task";
        let data = "data";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Messages(name).Progress();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[4]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        worker.dispatchEvent(evt as any);
    });
    it("source.Target().Messages().Cancel() should return stream of IBrokerMessage with category cancelCallback", () => {
        let name = "task";
        let data = "data";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Messages(name).Cancel();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[5]
            },
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        worker.dispatchEvent(evt as any);
    });
    it("source.Target().DeadLetters() should return stream of deadletters", () => {
        let name = "task";
        let data = "data";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").DeadLetters();
        data$.addListener({
            next: (m: MessageEvent) => { assert.deepEqual(m.data.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message = {
            data: data
        };
        let evt = new MessageEventMock("message", {data: message});
        worker.dispatchEvent(evt as any);
    });
    it("source.Target().Errors() should return stream of ErrorEvents", () => {
        let name = "task";
        let data = "data";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Errors();
        let errEvent: ErrorEventMock = {
            message: "TypeError",
            filename: "index.js",
            lineno: 13,
            colno: 18,
            type: "error"
        };
        data$.addListener({
            next: (m: ErrorEvent) => { assert.deepEqual(m.message, errEvent.message); },
            complete: () => {},
            error: () => {}
        });
        worker.dispatchEvent(errEvent as any);
    });
    it("source.Target().LifeCycle() should return life cycle messages", () => {
        let data$ = source.Target("worker").LifeCycle();
        data$.addListener({
            next: (m: string) => { assert.deepEqual(m, LifeCycleEvents[0]); },
            complete: () => {},
            error: () => {}
        });
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
    });
    it("source.Target().Subscribe() should return SubscribeChooseType", () => {
        let subscription = source.Target("worker").Subscribe("sub");
        assert.ok(subscription instanceof SubscribeChooseType);
    });
    it("source.Target().Subscribe().Messages().Data() should return stream of IBrokerMessage with category data", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Subscribe(sub).Messages(name).Data();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[0]
            },
            data: data
        };
        let publishMessage: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: sub,
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: publishMessage, ports: [channel.port1]});
        worker.dispatchEvent(evt as any);
        channel.port2.postMessage(message);
    });
    it("source.Target().Subscribe().Messages().Data() should return stream of IBrokerMessage with category progress", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Subscribe(sub).Messages(name).Data();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[1]
            },
            data: data
        };
        let publishMessage: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: sub,
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: publishMessage, ports: [channel.port1]});
        worker.dispatchEvent(evt as any);
        channel.port2.postMessage(message);
    });
    it("source.Target().Subscribe().Messages().Data() should return stream of IBrokerMessage with category cancel", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Subscribe(sub).Messages(name).Data();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[2]
            },
            data: data
        };
        let publishMessage: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: sub,
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: publishMessage, ports: [channel.port1]});
        worker.dispatchEvent(evt as any);
        channel.port2.postMessage(message);
    });
    it("source.Target().Subscribe().Messages().Data() should return stream of IBrokerMessage with category error", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Subscribe(sub).Messages(name).Data();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[3]
            },
            data: data
        };
        let publishMessage: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: sub,
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: publishMessage, ports: [channel.port1]});
        worker.dispatchEvent(evt as any);
        channel.port2.postMessage(message);
    });
    it("source.Target().Subscribe().Messages().Progress() should return stream of IBrokerMessage with category progressCallback", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Subscribe(sub).Messages(name).Progress();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[4]
            },
            data: data
        };
        let publishMessage: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: sub,
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: publishMessage, ports: [channel.port1]});
        worker.dispatchEvent(evt as any);
        channel.port2.postMessage(message);
    });
    it("source.Target().Subscribe().Messages().Data() should return stream of IBrokerMessage with category cancelCallback", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Subscribe(sub).Messages(name).Cancel();
        data$.addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[5]
            },
            data: data
        };
        let publishMessage: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: sub,
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: publishMessage, ports: [channel.port1]});
        worker.dispatchEvent(evt as any);
        channel.port2.postMessage(message);
    });
    it("source.Target().Subscribe().DeadLetters() should return stream of MessageEvent", () => {
        let channel = new MessageChannel();
        let data = "data";
        let sub = "sub";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Subscribe(sub).DeadLetters();
        data$.addListener({
            next: (m: MessageEvent) => { assert.deepEqual(m.data.data, data); },
            complete: () => {},
            error: () => {}
        });
        let message = {
            data: data
        };
        let publishMessage: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: sub,
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: publishMessage, ports: [channel.port1]});
        worker.dispatchEvent(evt as any);
        channel.port2.postMessage(message);
    });
    it("source.Target().Subscribe().LifeCycle() should return stream of life cycle messages", () => {
        let channel = new MessageChannel();
        let sub = "sub";
        ((brokers as any).worker as MessageBroker).attachTarget(workerTarget);
        let data$ = source.Target("worker").Subscribe(sub).LifeCycle();
        data$.addListener({
            next: (m: string) => { assert.deepEqual(m, LifeCycleEvents[0]); },
            complete: () => {},
            error: () => {}
        });
        let publishMessage: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: sub,
                category: MessagingCategories[0]
            },
            data: "data"
        };
        let evt = new MessageEventMock("message", {data: publishMessage, ports: [channel.port1]});
        worker.dispatchEvent(evt as any);
    });
});
describe("makeMessagingDriver sink tests", () => {
    it("Messages with no envelope.target should go to 'self' IBroker");
});