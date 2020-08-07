export type Error = globalThis.Error;
export interface LoggingOptions {
    color?: COLOR;
    name?: string;
}
export interface ServerOptions {
    port: number;
    loggingOptions?: LoggingOptions;
};
export interface ClientOptions {
    connectionAddress: string;
    loggingOptions?: LoggingOptions;
};
export interface SlaveOptions {
    loggingOptions?: LoggingOptions;
    serverOptions: ServerOptions;
    clientOptions: ClientOptions;
};
export interface MasterOptions {
    loggingOptions?: LoggingOptions;
    serverOptions: ServerOptions;
    slavesOptions: ServerOptions;
};
export interface SlaveData {
    ip: string;
    socket: SocketIO.Socket;
};

export interface AuthUserData {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean,
    role: {
        id: number;
        name: string;
    };
};

export interface SocketUser {
    user: AuthUserData;
    socket: SocketIO.Socket;
}

export interface ServerCommand {
    type: string;
    [key: string]: any;
};

export type Dictionary<T> = {
    [key in string | number]: T;
};;

export enum COLOR {
    Reset = "\x1b[0m",
    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m"
}