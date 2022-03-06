import { Command } from "commander";
import { mnemonic } from "thor-devkit";
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

        let lPrivateKey;

        if (process.env.VET_MNEMONIC !== undefined)
        {
            lPrivateKey = mnemonic.derivePrivateKey(process.env.VET_MNEMONIC.split(" "));
        }
        else if (process.env.VET_KEY !== undefined)
        {
            lPrivateKey = Buffer.from(process.env.VET_KEY, "hex");
        }
        else
        {
            process.stdout.write("env variable VET_KEY and VET_MNEMONIC missing. Either must be present\n");
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
