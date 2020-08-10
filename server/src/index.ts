import Master from "./classes/Master";
import Slave from "./classes/Slave";

const SLAVE_CONNECTION_PORT: number = 1001;
const SLAVE_BASE_ADDRESS: string = `http://localhost`;

async function main(): Promise<void> {
    const master: Master = new Master({ serverOptions: { port: 1000 }, slavesOptions: { port: SLAVE_CONNECTION_PORT } });
    await master.open();

    const slave: Slave = new Slave({ serverOptions: { port: 1002 }, clientOptions: { connectionAddress: `${SLAVE_BASE_ADDRESS}:${SLAVE_CONNECTION_PORT}` } });
    await slave.open();
    const slave2: Slave = new Slave({ serverOptions: { port: 1003 }, clientOptions: { connectionAddress: `${SLAVE_BASE_ADDRESS}:${SLAVE_CONNECTION_PORT}` } });
    await slave2.open();
}

main();