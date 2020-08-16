import axios, { AxiosResponse } from 'axios';
import Server from "./Server";
import { cookieStringToObject } from '../utils';
import { MasterOptions, LoggingOptions, COLOR, Dictionary, SlaveData, SocketUser, AuthUserData } from "../interfaces";

const API_ADDRESS: string = 'http://localhost/api';

class Master {
    private server!: Server;
    private slaves!: Server;
    private activatedSlaveAddresses: Array<string> = [];
    private _slaves: Dictionary<SlaveData> = {};
    private _users: Dictionary<SocketUser> = {};

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
        try {
            const { data }: AxiosResponse = await axios.get(`${API_ADDRESS}/servers`);
            this.activatedSlaveAddresses = data.map((serverData: Dictionary<string>): string => serverData.ip);
        } catch (e) {
            this.activatedSlaveAddresses = ['127.0.0.1'];
        }
    }

    public async open(): Promise<void> {
        try {
            await this.server.open();
            await this.slaves.open();
            this.setListener();
        } catch (e) {
            this.close();
        }
    }

    public close(): void {
        this.server.close();
        this.slaves.close();
    }

    private setListener(): void {
        this.slaves.connection.on('connection', this.slaveConnection.bind(this));
        this.server.connection.on('connection', this.userConnection.bind(this));
    }

    private isActivatedSlave(address: string): boolean {
        return this.activatedSlaveAddresses.indexOf(address) >= 0;
    }

    // Controller
    private slaveConnection(socket: SocketIO.Socket): void {
        const remoteAddress: string = socket.conn.remoteAddress.replace(/::ffff:/g, '');
        const isVaild: boolean = this.isActivatedSlave(remoteAddress);
        if (isVaild) {
            this._slaves[socket.id] = { ip: remoteAddress, socket: socket };
            this.slaves.log(this._slaves);
        } else {
            socket.disconnect();
        }
    }

    private async userConnection(socket: SocketIO.Socket): Promise<void> {
        const { cookie }: Dictionary<string> = socket.handshake.headers;
        const { jwt }: Dictionary<string> = cookieStringToObject(cookie);

        try {
            const headers: Dictionary<string> = { Authorization: `bearer ${jwt}` };
            const { data }: AxiosResponse = await axios.get(`${API_ADDRESS}/users/me`, { headers });
            this.addUser(socket, data);
        } catch {
            socket.disconnect();
        }
    }

    private addUser(socket: SocketIO.Socket, user: AuthUserData): void {
        if (this._users[user.id]) {
            this._users[user.id].socket.disconnect();
            delete this._users[user.id];
        }

        this._users[user.id] = { socket, user };
    }
}

export default Master;