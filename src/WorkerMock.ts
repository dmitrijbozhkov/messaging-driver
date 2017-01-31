export interface IListener {
    type: string;
    listener: (e: Event) => void | boolean;
}
export class MessageEventMock {
    constructor(type: string, params: MessageEventInit) {
        this.type = type;
        this.data = params.data;
        this.bubbles = params.bubbles;
        this.cancelable = params.cancelable;
        this.lastEventId = params.lastEventId;
        this.origin = params.origin;
        this.ports = params.ports;
        this.source = params.source;
    }
    public type: string;
    public data: any;
    public bubbles: boolean;
    public cancelable: boolean;
    public lastEventId: string;
    public origin: string;
    public ports: MessagePort[];
    public source: Window;
}
export class ErrorEventMock {
    public message: string;
    public filename: string;
    public lineno: number;
    public colno: number;
    public type: string;
}
export class WorkerMock implements Worker {
    private path: string;
    private listeners: IListener[];
    constructor(path: string) {
        this.path = path;
    }
    public onmessage: (e: MessageEvent) => void;
    public onerror: (e: ErrorEvent) => void;
    public onposted: (e: MessageEvent, ports: MessagePort[]) => void;
    public terminated: boolean = false;
    public addEventListener(type: string, handler: any) {
        this.listeners.push(handler);
    }
    public removeEventListener(type: string, handler: any) {
        let removeIndex = this.listeners.indexOf(handler);
        this.listeners.splice(removeIndex, removeIndex + 1);
    }
    public dispatchEvent(e: Event): boolean {
        let prevent = true;
        if (e.type === "message") {
            this.onmessage(e as any);
        } else if (e.type === "error") {
            this.onerror(e as any);
        }
        if (this.listeners) {
            this.listeners
            .filter((listener: IListener) => listener.type === typeof e)
            .forEach((listener: IListener) => {
                let preventDefault = listener.listener(e);
                if (preventDefault === false) {
                    prevent = true;
                }
            });
        }
        return prevent;
    }
    public postMessage(message: any, ports?: MessagePort[]): void {
        if (typeof ports === "undefined") {
            ports = [];
        }
        let ev =  document.createEvent("MessageEvent");
        ev.initMessageEvent("none", true, true, message, "lel", "", window);
        this.onposted(ev, ports);
    }
    public terminate() {
        this.terminated = true;
    }
}

export class FrameMock implements Worker {
    private listeners: IListener[];
    public onmessage: (e: MessageEvent) => void;
    public onerror: (e: ErrorEvent) => void;
    public onposted: (e: MessageEvent, ports: MessagePort[]) => void;
    public terminated: boolean = false;
    public addEventListener(type: string, handler: any) {
        this.listeners.push(handler);
    }
    public removeEventListener(type: string, handler: any) {
        let removeIndex = this.listeners.indexOf(handler);
        this.listeners.splice(removeIndex, removeIndex + 1);
    }
    public dispatchEvent(e: Event): boolean {
        let prevent = true;
        if (e.type === "message") {
            this.onmessage(e as any);
        } else if (e.type === "error") {
            this.onerror(e as any);
        }
        if (this.listeners) {
            this.listeners
            .filter((listener: IListener) => listener.type === typeof e)
            .forEach((listener: IListener) => {
                let preventDefault = listener.listener(e);
                if (preventDefault === false) {
                    prevent = true;
                }
            });
        }
        return prevent;
    }
    public postMessage(message: any, origin: string,  ports?: MessagePort[]): void {
        if (typeof ports === "undefined") {
            ports = [];
        }
        let ev =  document.createEvent("MessageEvent");
        ev.initMessageEvent("none", true, true, message, "lel", "", window);
        this.onposted(ev, ports);
    }
    public terminate() {
        this.terminated = true;
    }
}