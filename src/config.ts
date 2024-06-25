import { polkadot } from "@polkadot-api/descriptors";
import type { Config } from "@reactive-dot/core";
import { InjectedWalletAggregator } from "@reactive-dot/core/wallets.js";
import { WebSocketProvider } from "polkadot-api/ws-provider/web";

const config: Config = {
  chains: {
    polkadot: {
      descriptor: polkadot,
      provider: WebSocketProvider("wss://polkadot-rpc.publicnode.com"),
    },
  },
  wallets: [new InjectedWalletAggregator()],
};

export default config;
