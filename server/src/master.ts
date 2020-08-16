import Master from "./classes/Master";
import { Dictionary } from "./interfaces";

async function main(): Promise<void> {
    const args: Dictionary<string> = JSON.parse(process.env.npm_config_argv);
    const port: number = Number(args.original[2]) || Math.round(1000 + Math.random() * 5000);
    const master: Master = new Master({ serverOptions: { port }, slavesOptions: { port: port + 1 } });
    await master.open();
}

main();