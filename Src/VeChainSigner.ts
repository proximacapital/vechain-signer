import { Command } from "commander";
import { EChainTag } from "./Enums";
import { SignTx } from "./SignTx";

let gStdIn = "";

const lProgram: Command = new Command();
lProgram
    .argument("[calldata]", "transaction data, will be read from stdin if available")
    .option("-t, --to <address>", "address of the one and only clause, null for deployments")
    .option("-v, --value <wei>", "value to attach to the one and only clause", "0")
    .option("-g, --gas <amount>", "override gas estimation with custom value")
    .option("-n, --network <mainnet | testnet>", "the network to use", "testnet")
    .action((aInput: string | undefined) =>
    {
        const lInput = gStdIn !== "" ? gStdIn : aInput;
        const lOptions = lProgram.opts();

        const lPrivateKey = process.env.VET_KEY !== undefined
            ? Buffer.from(process.env.VET_KEY, "hex")
            : undefined;

        if (lPrivateKey === undefined)
        {
            process.stdout.write("env variable VET_KEY missing\n");
            return;
        }

        SignTx(
            {
                To: lOptions.to,
                Data: lInput ?? "0x",
                Value: lOptions.value,
                ChainTag: lOptions.network?.toLowerCase() === "mainnet" ? EChainTag.Mainnet : EChainTag.Testnet,
                Gas: lOptions.gas,
            },
            lPrivateKey,
        ).then((aResult: string) =>
        {
            process.stdout.write(aResult + "\n");
        });
    });

if (process.stdin.isTTY)
{
    lProgram.parse(process.argv);
}
else
{
    process.stdin.on("readable", () =>
    {
        const lChunk = process.stdin.read();

        if (lChunk !== null)
        {
            gStdIn += lChunk.toString();
        }
    });

    process.stdin.on("end", () =>
    {
        gStdIn = gStdIn.trim();
        lProgram.parse(process.argv);
    });
}
