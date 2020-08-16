import * as createExpress from 'express';
import * as SocketIO from 'socket.io';
import * as Http from 'http';
import * as ip from 'public-ip';
import { Express } from 'express';
import { ServerOptions, COLOR } from '../interfaces';

class Server {
    public ip!: string;
    public port!: number;
    public connection!: SocketIO.Server;
    private express: Express = createExpress();
    private httpServer!: Http.Server;
    private name!: string;
    private color!: COLOR;

    constructor(options: ServerOptions) {
        const colors: Array<string> = Object.keys(COLOR);
        this.port = options?.port || 0;
        this.color = options?.loggingOptions?.color || COLOR[colors[Math.round(Math.random() * (colors.length - 1))]];
        this.name = options?.loggingOptions?.name || 'Server';
    }

    public async open(): Promise<void> {
        try {
            this.ip = await new Promise(async (resolve, reject): Promise<void> => {
                const address = ip.v4();
                setTimeout((): void => { address.cancel(); reject('error'); }, 1000);
                resolve(await address);
            });
        } catch (e) {
            this.ip = '127.0.0.1';
        }

        return new Promise((resolve, reject): void => {
            this.httpServer = this.express.listen(this.port);

            this.httpServer.once('error', (err: Error): void => {
                this.close();
                reject();
            });

            this.httpServer.once('listening', (): void => {
                try {
                    this.connection = SocketIO(this.httpServer, { serveClient: false });
                    this.log(`┌───────────────────────────────────────────┐`);
                    this.log(`│ Name        : ${this.name.padEnd(28)}│`);
                    this.log(`│ Status      : ${COLOR.FgGreen}Opened${COLOR.Reset}                      │`);
                    this.log(`│ IP Address  : ${this.ip.padEnd(28)}│`);
                    this.log(`│ Port Number : ${this.port.toString().padEnd(28)}│`);
                    this.log(`└───────────────────────────────────────────┘`);
                    resolve();
                } catch (error) {
                    this.close();
                    reject();
                }
            });
        });
    }

    public close(): void {
        this.connection?.removeAllListeners();
        this.connection?.close();
        this.httpServer?.close();
        this.log(`┌───────────────────────────────────────────┐`);
        this.log(`│ Name        : ${this.name.padEnd(28)}│`);
        this.log(`│ Status      : ${COLOR.FgRed}Closed${COLOR.Reset}                      │`);
        this.log(`│ IP Address  : ${this.ip.padEnd(28)}│`);
        this.log(`│ Port Number : ${this.port.toString().padEnd(28)}│`);
        this.log(`└───────────────────────────────────────────┘`);
    }

    public log(...message: any): void {
        console.log(this.color, `[${new Date().toISOString()}] (${this.name})${COLOR.Reset}`, ...message);
    }
}

export default Server;