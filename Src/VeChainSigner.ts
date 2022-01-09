import { Command } from "commander";
import { EChainTag } from "./Enums";
import { SignTx } from "./SignTx";

let gStdIn = "";

const lProgram: Command = new Command();
lProgram
    .argument("[calldata]", "transaction data, will be read from stdin if available")
    .requiredOption("-t, --to <address>", "address of the one and only clause")
    .option("-v, --value <wei>", "value to attach to the one and only clause", "0")
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
            process.stdout.write("no set VET_KEY env variable\n");
            return;
        }

        const lSignedTx = SignTx(
            {
                To: lOptions.to,
                Data: lInput ?? "0x",
                Value: lOptions.value,
                ChainTag: lOptions.network?.toLowerCase() === "mainnet" ? EChainTag.Mainnet : EChainTag.Testnet,
            },
            lPrivateKey,
        );

        process.stdout.write(lSignedTx);
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
        lProgram.parse(process.argv);
    });
}
