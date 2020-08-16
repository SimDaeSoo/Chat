import * as SocketIOClient from 'socket.io-client';
import { COLOR, ClientOptions } from '../interfaces';

class Client {
    public connectionAddress!: string;
    public connection!: SocketIOClient.Socket;
    private name!: string;
    private color: COLOR;

    constructor(options: ClientOptions) {
        const colors = Object.keys(COLOR);
        this.connectionAddress = options.connectionAddress;
        this.color = options?.loggingOptions?.color || COLOR[colors[Math.round(Math.random() * (colors.length - 1))]];
        this.name = options?.loggingOptions?.name || 'Client';
    }

    public connect(): void {
        this.connection = SocketIOClient(this.connectionAddress);
        this.connection.once('connect', (): void => {
            this.log(`┌───────────────────────────────────────────┐`);
            this.log(`│ Name        : ${this.name.padEnd(28)}│`);
            this.log(`│ Status      : ${COLOR.FgGreen}Connected${COLOR.Reset}                   │`);
            this.log(`│ Host Server : ${this.connectionAddress.padEnd(28)}│`);
            this.log(`└───────────────────────────────────────────┘`);
        });

        this.connection.once('disconnect', (): void => {
            this.log(`┌───────────────────────────────────────────┐`);
            this.log(`│ Name        : ${this.name.padEnd(28)}│`);
            this.log(`│ Status      : ${COLOR.FgRed}Disconnected${COLOR.Reset}                │`);
            this.log(`│ Host Server : ${this.connectionAddress.padEnd(28)}│`);
            this.log(`└───────────────────────────────────────────┘`);
        });
    }

    public disconnect(): void {
        this.connection?.removeAllListeners();
        this.connection?.close();
    }

    public log(...message: any): void {
        console.log(this.color, `[${new Date().toISOString()}] (${this.name})${COLOR.Reset}`, ...message);
    }
}

export default Client;