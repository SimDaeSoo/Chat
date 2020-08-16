import axios, { AxiosResponse } from 'axios';
import Server from "./Server";
import { cookieStringToObject, randomSeed } from '../utils';
import { MasterOptions, LoggingOptions, COLOR, Dictionary, SlaveData, UserData, AuthUserData, USER_STATUS } from "../interfaces";

const API_ADDRESS: string = 'http://localhost/api';

class Master {
    private server!: Server;
    private slaves!: Server;
    private _slaves: Dictionary<SlaveData> = {};
    private _users: Dictionary<UserData> = {};
    private activatedSlaveAddresses: Array<string> = [];

    constructor(options: MasterOptions) {
        const colors: Array<string> = Object.keys(COLOR);
        const loggingOptions: LoggingOptions = {};
        loggingOptions.color = options?.loggingOptions?.color || COLOR[colors[Math.round(Math.random() * (colors.length - 1))]];
        loggingOptions.name = options?.loggingOptions?.name || 'Master';

        this.server = new Server({ ...options.serverOptions, loggingOptions });
        this.slaves = new Server({ ...options.slavesOptions, loggingOptions });
    }

    public async open(): Promise<void> {
        try {
            const { data }: AxiosResponse = await axios.get(`${API_ADDRESS}/servers`);
            this.activatedSlaveAddresses = ['127.0.0.1', ...data.map((serverData: Dictionary<string>): string => serverData.ip)];
        } catch (e) {
            this.activatedSlaveAddresses = ['127.0.0.1'];
        }

        try {
            await this.server.open();
            await this.slaves.open();
            this.slaves.connection.on('connection', this.slaveConnected.bind(this));
            this.server.connection.on('connection', this.userConnected.bind(this));
        } catch (e) {
            this.close();
        }
    }

    public close(): void {
        this.server.close();
        this.slaves.close();
    }

    private isActivatedSlave(address: string): boolean {
        const isVaild: boolean = this.activatedSlaveAddresses.indexOf(address) >= 0;
        return isVaild;
    }

    // Slave Controller ----------------------------------------------------------------------------------------------------------------------
    private setSlaveServerListener(slave: SlaveData): void {
        slave.socket.on('disconnecting', () => this.slaveDisconnected(slave));
        slave.socket.on('initialize', (ip: string, port: number) => this.slaveInitialize(ip, port, slave));
    }

    private slaveConnected(socket: SocketIO.Socket): void {
        const remoteAddress: string = socket.conn.remoteAddress.replace(/::ffff:/g, '');
        const isVaild: boolean = this.isActivatedSlave(remoteAddress);

        if (isVaild) {
            this._slaves[socket.id] = { ip: '', port: 0, users: [], socket: socket, initialized: false };
            this.setSlaveServerListener(this._slaves[socket.id]);
        } else {
            socket.disconnect();
        }
    }

    private slaveDisconnected(slave: SlaveData): void {
        this.log('Slave Disconnected', { ip: this._slaves[slave.socket.id].ip, port: this._slaves[slave.socket.id].port, users: this._slaves[slave.socket.id].users.length }, COLOR.FgRed);
        delete this._slaves[slave.socket.id];
    }

    private slaveInitialize(ip: string, port: number, slave: SlaveData): void {
        const isVaild: boolean = this.isActivatedSlave(ip);

        if (isVaild) {
            slave.ip = ip;
            slave.port = port;
            slave.initialized = true;
            this.log('Slave Connected', { ip: slave.ip, port: slave.port, users: slave.users.length });
        } else {
            slave.socket.disconnect();
        }
    }

    private log(title: string, data: Dictionary<any>, color?: COLOR): void {
        this.slaves.log(`┌─────────────────────────────────────────────────────┐`);
        this.slaves.log(`│ ${color || COLOR.FgGreen}${title.padEnd(52)}${COLOR.Reset}│`);
        for (const key in data) {
            this.slaves.log(`│ ${key.padEnd(11)} : ${data[key].toString().padEnd(37)} │`);
        }
        this.slaves.log(`└─────────────────────────────────────────────────────┘`);
    }

    // User Controller ----------------------------------------------------------------------------------------------------------------------
    private setUserServerListener(user: UserData): void {
        user.socket.on('disconnecting', () => this.userDisconnected(user));
    }

    private async userConnected(socket: SocketIO.Socket): Promise<void> {
        const { cookie }: Dictionary<string> = socket.handshake.headers;
        const { jwt }: Dictionary<string> = cookieStringToObject(cookie);

        try {
            const headers: Dictionary<string> = { Authorization: `bearer ${jwt}` };
            const { data }: AxiosResponse = await axios.get(`${API_ADDRESS}/users/me`, { headers });
            const seed: string = `${randomSeed(20)}${Date.now()}`;
            socket.emit('seed', seed);

            const user: UserData = this.addUser(socket, data, seed);
            this.setUserServerListener(user);
        } catch (e) {
            socket.disconnect();
        }
    }

    private userDisconnected(user: UserData): void {
        if (user.slave) {
            // Slave 에서도 제거한다.
            user?.slave.socket.emit('disconnectUser', { data: user.data, seed: user.seed });
        }

        this.log('User Disconnected', {
            id: user.data.id,
            seed: user.seed,
            username: user.data.username,
            email: user.data.email,
            provider: user.data.provider,
            status: user.status,
            slave: `${user.slave?.ip || ''}:${user.slave?.port || ''}`
        }, COLOR.FgRed);
        this.removeUser(user);
    }

    private addUser(socket: SocketIO.Socket, data: AuthUserData, seed: string): UserData {
        if (this._users[data.id]) {
            this._users[data.id].socket.disconnect();
            delete this._users[data.id];
        }

        this._users[data.id] = { socket, data, status: USER_STATUS.CONNECTED, seed };
        this.log('User Connected', {
            id: data.id,
            seed,
            username: data.username,
            email: data.email,
            provider: data.provider,
            status: this._users[data.id].status,
            slave: ''
        });
        return this._users[data.id];
    }

    private removeUser(user: UserData): void {
        delete this._users[user.data.id];
    }
}

export default Master;