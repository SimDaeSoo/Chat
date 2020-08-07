import Server from "./Server";
import { MasterOptions, LoggingOptions, COLOR, ServerCommand } from "../interfaces";

interface Dictionary<T> {
    [key: string]: T;
}

interface SlaveData {
    ip: string;
    socket: SocketIO.Socket;
}

class Master {
    private server!: Server;
    private slaves!: Server;
    private activatedSlaveAddresses: Array<string> = [];
    private _slaves: Dictionary<SlaveData> = {};

    constructor(options: MasterOptions) {
        const colors: Array<string> = Object.keys(COLOR);
        const loggingOptions: LoggingOptions = {};
        loggingOptions.color = options?.loggingOptions?.color || COLOR[colors[Math.round(Math.random() * (colors.length - 1))]];
        loggingOptions.name = options?.loggingOptions?.name || 'Master';

        this.server = new Server({ ...options.serverOptions, loggingOptions });
        this.slaves = new Server({ ...options.slavesOptions, loggingOptions });
        this.initialize();
    }

    private async initialize(): Promise<void> {
        // this.activatedSlaveAddresses = await getActivatedSlaveAddresses();
        this.activatedSlaveAddresses = ['127.0.0.1'];
    }

    public async open(): Promise<void> {
        await this.server.open();
        await this.slaves.open();
        this.setListener();
    }

    public close(): void {
        this.server.close();
        this.slaves.close();
    }

    private setListener(): void {
        this.slaves.connection.on('connection', (socket: SocketIO.Socket): void => {
            const remoteAddress: string = socket.conn.remoteAddress.replace(/::ffff:/g, '');
            const isVaild: boolean = this.isActivatedSlave(remoteAddress);
            if (isVaild) {
                this._slaves[socket.id] = { ip: remoteAddress, socket: socket };
            } else {
                socket.disconnect();
            }
        });

        this.server.connection.on('connection', (socket: SocketIO.Socket): void => {
            this.server.log(socket);
        });
    }

    private isActivatedSlave(address: string): boolean {
        return this.activatedSlaveAddresses.indexOf(address) >= 0;
    }
}

export default Master;