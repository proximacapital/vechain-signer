import { Driver, SimpleNet } from "@vechain/connex-driver";
import { Framework  } from "@vechain/connex-framework";
import { secp256k1, Transaction } from "thor-devkit";
import { EChainTag, NETWORK_PROVIDER } from "./Enums";


export async function SignTx(
    aTxArgs: {
        To: string | undefined;
        Data: string;
        Value: string;
        ChainTag: EChainTag;
        Gas?: string;
    },
    aPrivKey: Buffer,
): Promise<string>
{
    const lNet = new SimpleNet(NETWORK_PROVIDER[aTxArgs.ChainTag]);
    const lDriver = await Driver.connect(lNet);
    const lConnex = new Framework(lDriver);
    const lLatestBlockId = lConnex.thor.status.head.id;
    const lBlockRef = lLatestBlockId.slice(0, 18);  // 18 chars = "0x" + 8 bytes
    lDriver.close();

    const lClauses = [{
        to: aTxArgs.To as unknown as null,  // thor-devkit happily signs undefined
        value: aTxArgs.Value,
        data: aTxArgs.Data,
    }];

    const lGasEstimate = Transaction.intrinsicGas(lClauses);
    const lTxBody: Transaction.Body = {
        chainTag: aTxArgs.ChainTag,
        blockRef: lBlockRef,
        expiration: 32,  // 5 mins 20 sec
        clauses: lClauses,
        gasPriceCoef: 0,
        gas: aTxArgs.Gas ?? (lGasEstimate * 1.25).toFixed(0),  // take 25% on top of estimate
        dependsOn: null,
        nonce: 1337,
    };

    const lTx = new Transaction(lTxBody);
    const lSigningHash = lTx.signingHash();
    lTx.signature = secp256k1.sign(lSigningHash, Buffer.from(aPrivKey));

    return "0x" + lTx.encode().toString("hex");
}

