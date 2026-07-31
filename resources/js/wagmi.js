import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

// Hardcoding your official Reown Project ID directly for maximum reliability
const projectId = '7ecf37c947bf45f79872127e4876f649';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(), // For desktop extension sign-ins
    walletConnect({ 
      projectId: projectId,
      showQrModal: true,
      qrModalOptions: {
        featuredWalletIds: [
          'c57ca0a7e4ee5166b58814b8a258102ec693e20d15114cf67dec0f7402976703', // MetaMask ID
          '4622a433d00d1d2875a6001474ee27c88b3b955fcd0'  // Trust Wallet ID
        ],
        enableExplorer: false // Disables the generic explorer list to make loading instant
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});