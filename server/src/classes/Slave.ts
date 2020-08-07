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
        await this.server.open();
        this.client.connect();
        this.setListener();
    }

    public close(): void {
        this.server.close();
        this.client.disconnect();
    }

    private setListener(): void {
        this.client.connection.on('disconnect', (): void => {
            this.close();
        });
    }
}

export default Slave;