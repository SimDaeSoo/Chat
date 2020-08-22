import Server from "./Server";
import Client from "./Client";
import { SlaveOptions, LoggingOptions, COLOR, Dictionary } from "../interfaces";

class Slave {
    private server!: Server;
    private client!: Client;

    constructor(options: SlaveOptions) {
        const colors: Array<string> = Object.keys(COLOR);
        const loggingOptions: LoggingOptions = {};
        loggingOptions.color = options?.loggingOptions?.color || COLOR[colors[Math.round(Math.random() * (colors.length - 1))]];
        loggingOptions.name = options?.loggingOptions?.name || 'Slave';

        this.server = new Server({ ...options.serverOptions, loggingOptions });
        this.client = new Client({ ...options.clientOptions, loggingOptions });
    }

    public async open(): Promise<void> {
        try {
            await this.server.open();
            this.client.connect();
            this.setListener();
        } catch (e) {
            this.close();
        }
    }

    public close(): void {
        // Save All Data...
        this.server.close();
        this.client.disconnect();
    }

    private log(title: string, data: Dictionary<any>, color?: COLOR): void {
        this.server.log(`┌─────────────────────────────────────────────────────┐`);
        this.server.log(`│ ${color || COLOR.FgGreen}${title.padEnd(52)}${COLOR.Reset}│`);
        for (const key in data) {
            this.server.log(`│ ${key.padEnd(11)} : ${data[key].toString().padEnd(37)} │`);
        }
        this.server.log(`└─────────────────────────────────────────────────────┘`);
    }

    private setListener(): void {
        this.server.connection.on('connection', this.userConnected.bind(this));
        this.client.connection.on('connect', this.masterConnected.bind(this));
    }

    private async userConnected(socket: SocketIO.Socket): Promise<void> {
        this.log('User Connected', {
            socket_id: socket.id
        });
    }

    private masterConnected(): void {
        this.client.connection.emit('initialize', this.server.ip, this.server.port);
        this.client.connection.on('disconnect', (): void => {
            this.close();
            setTimeout(this.open.bind(this), 1000);
        });
    }
}

export default Slave;