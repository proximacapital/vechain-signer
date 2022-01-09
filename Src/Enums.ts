
export enum EChainTag
{
    Mainnet = 0x4a,
    Testnet = 0x27,
}

export const NETWORK_PROVIDER: { [key in EChainTag]: string } =
{
    [EChainTag.Mainnet]: "https://mainnet.veblocks.net",
    [EChainTag.Testnet]: "https://testnet.veblocks.net",
};
