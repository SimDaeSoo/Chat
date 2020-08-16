import Server from "./Server";
import Client from "./Client";
import { SlaveOptions, LoggingOptions, COLOR } from "../interfaces";

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

    private setListener(): void {
        this.server.connection.on('connection', this.userConnected.bind(this));
        this.client.connection.on('connect', this.masterConnected.bind(this));
    }

    private async userConnected(socket: SocketIO.Socket): Promise<void> {
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