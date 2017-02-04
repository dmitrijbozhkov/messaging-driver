export interface IListener {
    type: string;
    listener: (e: Event) => void | boolean;
}
export declare class MessageEventMock {
    constructor(type: string, params: MessageEventInit);
    type: string;
    data: any;
    bubbles: boolean;
    cancelable: boolean;
    lastEventId: string;
    origin: string;
    ports: MessagePort[];
    source: Window;
}
export declare class ErrorEventMock {
    message: string;
    filename: string;
    lineno: number;
    colno: number;
    type: string;
}
export declare class WorkerMock implements Worker {
    private path;
    private listeners;
    constructor(path: string);
    onmessage: (e: MessageEvent) => void;
    onerror: (e: ErrorEvent) => void;
    onposted: (e: MessageEvent, ports: MessagePort[]) => void;
    terminated: boolean;
    addEventListener(type: string, handler: any): void;
    removeEventListener(type: string, handler: any): void;
    dispatchEvent(e: Event): boolean;
    postMessage(message: any, ports?: MessagePort[]): void;
    terminate(): void;
}
export declare class FrameMock implements Worker {
    private listeners;
    onmessage: (e: MessageEvent) => void;
    onerror: (e: ErrorEvent) => void;
    onposted: (e: MessageEvent, ports: MessagePort[]) => void;
    terminated: boolean;
    addEventListener(type: string, handler: any): void;
    removeEventListener(type: string, handler: any): void;
    dispatchEvent(e: Event): boolean;
    postMessage(message: any, origin: string, ports?: MessagePort[]): void;
    terminate(): void;
}
