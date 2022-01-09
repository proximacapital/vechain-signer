import { secp256k1, Transaction } from "thor-devkit";
import { EChainTag } from "./Enums";

export function SignTx(
    aTxArgs: {
        To: string;
        Data: string;
        Value: string;
        ChainTag: EChainTag;
    },
    aPrivKey: Buffer,
): string
{
    const lClauses = [{
        to: aTxArgs.To,
        value: aTxArgs.Value,
        data: aTxArgs.Data,
    }];

    const lGas = Transaction.intrinsicGas(lClauses);

    const lTxBody: Transaction.Body = {
        chainTag: aTxArgs.ChainTag,
        blockRef: "0x0000000000000000",
        expiration: 32,
        clauses: lClauses,
        gasPriceCoef: 0,
        gas: lGas,
        dependsOn: null,
        nonce: 1337,
    };

    const lTx = new Transaction(lTxBody);
    const lSigningHash = lTx.signingHash();
    lTx.signature = secp256k1.sign(lSigningHash, Buffer.from(aPrivKey));

    return lTx.encode().toString("hex");
}

