import Slave from "./classes/Slave";
import { Dictionary } from "./interfaces";

// ENV 로 빼야함.
const MASTER_ADDRESS: string = `http://localhost:1001`;

async function main(): Promise<void> {
    const args: Dictionary<string> = JSON.parse(process.env.npm_config_argv);
    const port: number = Number(args.original[2]) || Math.round(1000 + Math.random() * 5000);
    const slave: Slave = new Slave({ serverOptions: { port }, clientOptions: { connectionAddress: `${MASTER_ADDRESS}` } });
    await slave.open();
}

main();