import * as assert from "assert";
import { IBrokerMessage, MessagingTypes, MessagingCategories, LifeCycleEvents, IPortMessage, IAttachMessage } from "../../lib/AbstractBroker";
import { makeMessagingDriver } from "../../lib/makeMessagingDriver";
import { FrameTarget, WorkerTarget, PortTarget, TargetRoute } from "../../lib/MessageTargets";
import { FrameMock, WorkerMock, MessageEventMock, ErrorEventMock } from "../../lib/WorkerMock";
import { MessageBroker, NotifyProducer, IBroker } from "../../lib/MessageBroker";
import {  ChooseCategory, ChooseType, SubscribeChooseType } from "../../lib/QueryMessage";
import { SinkRouter } from "../../lib/SinkRouter";
import { Stream } from "xstream";
describe("makeMessagingDriver source tests", () => {
    let channel: MessageChannel;
    let frame: FrameMock;
    let worker: WorkerMock;
    let frameTarget: FrameTarget;
    let workerTarget: WorkerTarget;
    let portTarget: PortTarget;
    let broker: MessageBroker;
    let source: ChooseType;
    beforeEach(() => {
        channel = new MessageChannel();
        frame = new FrameMock();
        worker = new WorkerMock("path");
        frameTarget = new FrameTarget(frame as any, new TargetRoute());
        workerTarget = new WorkerTarget(worker as any, new TargetRoute());
        portTarget = new PortTarget(channel.port1, new TargetRoute());
        broker = new MessageBroker();
        source = new ChooseType(broker);
    });
    it("source should return ChooseCategory", () => {
        let isChooseType = source instanceof ChooseType;
        assert.ok(isChooseType);
    });
    it("source.Messages() should return ChooseCategory", () => {
        let isChooseCategory = source.Messages("task") instanceof ChooseCategory;
        assert.ok(isChooseCategory);
    });
    it("source.Messages().Data() should return stream of IBrokerMessage with category data", () => {
        let name = "task";
        let data = "data";
        broker.attachTarget(workerTarget);
        let data$ = source.Messages(name).Data();
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
    it("source.Messages().Data() should return stream of IBrokerMessage with category progress", () => {
        let name = "task";
        let data = "data";
        broker.attachTarget(workerTarget);
        let data$ = source.Messages(name).Data();
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
    it("source.Messages().Data() should return stream of IBrokerMessage with category cancel", () => {
        let name = "task";
        let data = "data";
        broker.attachTarget(workerTarget);
        let data$ = source.Messages(name).Data();
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
    it("source.Messages().Data() should return stream of IBrokerMessage with category error", () => {
        let name = "task";
        let data = "data";
        broker.attachTarget(workerTarget);
        let data$ = source.Messages(name).Data();
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
    it("source.Messages().Progress() should return stream of IBrokerMessage with category progressCallback", () => {
        let name = "task";
        let data = "data";
        broker.attachTarget(workerTarget);
        let data$ = source.Messages(name).Progress();
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
    it("source.Messages().Cancel() should return stream of IBrokerMessage with category cancelCallback", () => {
        let name = "task";
        let data = "data";
        broker.attachTarget(workerTarget);
        let data$ = source.Messages(name).Cancel();
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
    it("source.Messages().All() should return stream of all IBrokerMessage", () => {
        let name = "task";
        let data = "data";
        broker.attachTarget(workerTarget);
        let data$ = source.Messages(name).All();
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
    it("source.DeadLetters() should return stream of deadletters", () => {
        let name = "task";
        let data = "data";
        broker.attachTarget(workerTarget);
        let data$ = source.DeadLetters();
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
    it("source.Errors() should return stream of ErrorEvents", () => {
        let name = "task";
        let data = "data";
        broker.attachTarget(workerTarget);
        let data$ = source.Errors();
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
    it("source.LifeCycle() should return life cycle messages", () => {
        let data$ = source.LifeCycle();
        data$.addListener({
            next: (m: string) => { assert.deepEqual(m, LifeCycleEvents[0]); },
            complete: () => {},
            error: () => {}
        });
        broker.attachTarget(workerTarget);
    });
    it("source.Subscribe() should return SubscribeChooseType", () => {
        let subscription = source.Subscribe("sub");
        assert.ok(subscription instanceof SubscribeChooseType);
    });
    it("source.Subscribe().Messages().Data() should return stream of IBrokerMessage with category data", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        broker.attachTarget(workerTarget);
        let data$ = source.Subscribe(sub).Messages(name).Data();
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
    it("source.Subscribe().Messages().Data() should return stream of IBrokerMessage with category progress", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        broker.attachTarget(workerTarget);
        let data$ = source.Subscribe(sub).Messages(name).Data();
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
    it("source.Subscribe().Messages().Data() should return stream of IBrokerMessage with category cancel", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        broker.attachTarget(workerTarget);
        let data$ = source.Subscribe(sub).Messages(name).Data();
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
    it("source.Subscribe().Messages().Data() should return stream of IBrokerMessage with category error", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        broker.attachTarget(workerTarget);
        let data$ = source.Subscribe(sub).Messages(name).Data();
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
    it("source.Subscribe().Messages().Progress() should return stream of IBrokerMessage with category progressCallback", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        broker.attachTarget(workerTarget);
        let data$ = source.Subscribe(sub).Messages(name).Progress();
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
    it("source.Subscribe().Messages().Data() should return stream of IBrokerMessage with category cancelCallback", () => {
        let channel = new MessageChannel();
        let name = "task";
        let data = "data";
        let sub = "sub";
        broker.attachTarget(workerTarget);
        let data$ = source.Subscribe(sub).Messages(name).Cancel();
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
    it("source.Subscribe().DeadLetters() should return stream of MessageEvent", () => {
        let channel = new MessageChannel();
        let data = "data";
        let sub = "sub";
        broker.attachTarget(workerTarget);
        let data$ = source.Subscribe(sub).DeadLetters();
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
    it("source.Subscribe().LifeCycle() should return stream of life cycle messages", () => {
        let channel = new MessageChannel();
        let sub = "sub";
        broker.attachTarget(workerTarget);
        let data$ = source.Subscribe(sub).LifeCycle();
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
    let selfWorker: WorkerMock;
    let wWorker: WorkerMock;
    let selfTarget: WorkerTarget;
    let wTarget: WorkerTarget;
    let wBroker: MessageBroker;
    let router: SinkRouter;
    let name = "mess";
    beforeEach(() => {
        selfWorker = new WorkerMock("self");
        wWorker = new WorkerMock("worker");
        selfTarget = new WorkerTarget(selfWorker, new TargetRoute());
        wTarget = new WorkerTarget(wWorker, new TargetRoute());
        wBroker = new MessageBroker();
        wBroker.attachTarget(wTarget);
        router = new SinkRouter(wBroker);
    });
    it("Messages with type message and no target should route IBrokerMessage to 'worker' MessageBroker.sendMessage()", () => {
        let data = "data";
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[0]
            },
            data: data
        };
        wWorker.onposted = (m: MessageEvent) => { assert.deepEqual(m.data.data, data); };
        router.next(message);
    });
    it("Messages with type publish and no target should route IPortMessage to workers MessageBroker.sendPublish()", () => {
        let data = "data";
        let channel = new MessageChannel();
        let message: IPortMessage = {
            envelope: {
                type: MessagingTypes[1],
                name: name,
                category: MessagingCategories[0]
            },
            data: data,
            port: channel.port1
        };
        wWorker.onposted = (m: MessageEvent, ports: MessagePort[]) => {
            assert.deepEqual(m.data.data, data);
            assert.deepEqual(ports[0], channel.port1);
        };
        router.next(message);
    });
    it("Messages with type subscribe and no target should route IPortMessage to workers MessageBroker.publishHandler()", () => {
        let data = "data";
        let channel = new MessageChannel();
        let sub: IPortMessage = {
            envelope: {
                type: MessagingTypes[2],
                name: name,
                category: MessagingCategories[0]
            },
            data: data,
            port: channel.port1
        };
        let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: "mes",
                category: MessagingCategories[0]
            },
            data: data
        };
        router.next(sub);
        let subBroker: IBroker = wBroker.subscribeHandler(name);
        let notify = new NotifyProducer<IBrokerMessage>();
        Stream.create(subBroker.attachMessage(notify, "mes")).addListener({
            next: (m: IBrokerMessage) => { assert.deepEqual(m.data, data); },
            error: () => {},
            complete: () => {}
        });
        channel.port2.postMessage(message);
    });
    it("Messages with type broker, target 'worker' and category 'dispose' should route IAttachMessage to 'worker' MessageBroker.disposeTarget()", () => {
        let data = "data";
        let message: IAttachMessage = {
            envelope: {
                type: MessagingTypes[3],
                name: name,
                category: MessagingCategories[7]
            },
            data: data,
            target: null
        };
        let notify = new NotifyProducer<string>();
        Stream.create(wBroker.attachLifeCycle(notify)).addListener({
            next: (m: string) => { assert.deepEqual(m, LifeCycleEvents[1]); },
            error: () => {},
            complete: () => {}
        });
        router.next(message);
    });
    it("Messages with type broker, target 'worker' and category 'attach' should route IAttachMessage to 'worker' MessageBroker.attachTarget()", () => {
        let data = "data";
        let message: IAttachMessage = {
            envelope: {
                type: MessagingTypes[3],
                name: name,
                category: MessagingCategories[6]
            },
            data: data,
            target: selfTarget
        };
        let messageDispose: IAttachMessage = {
            envelope: {
                type: MessagingTypes[3],
                name: name,
                category: MessagingCategories[7]
            },
            data: data,
            target: null
        };
        router.next(messageDispose);
        let notify = new NotifyProducer<string>();
        Stream.create(wBroker.attachLifeCycle(notify)).addListener({
            next: (m: string) => { assert.deepEqual(m, LifeCycleEvents[0]); },
            error: () => {},
            complete: () => {}
        });
        router.next(message);
    });
    it("Messages with type broker and any category except attach and dispose should throw exception", () => {
        let data = "data";
        let message: IAttachMessage = {
            envelope: {
                type: MessagingTypes[3],
                name: name,
                category: MessagingCategories[1]
            },
            data: data,
            target: selfTarget
        };
        assert.throws(() => {
            router.next(message);
        });
    });
});