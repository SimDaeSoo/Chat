import Master from "./classes/Master";
import Slave from "./classes/Slave";

async function main(): Promise<void> {
    const master: Master = new Master({ serverOptions: { port: 1000 }, slavesOptions: { port: 1001 } });
    await master.open();

    const slave: Slave = new Slave({ serverOptions: { port: 1002 }, clientOptions: { connectionAddress: 'http://localhost:1001' } });
    await slave.open();
    const slave2: Slave = new Slave({ serverOptions: { port: 1003 }, clientOptions: { connectionAddress: 'http://localhost:1001' } });
    await slave2.open();
}

main();