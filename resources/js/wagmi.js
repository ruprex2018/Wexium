import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

// Read the Project ID from your .env
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(), // For desktop extension sign-ins
    walletConnect({ 
      projectId: projectId,
      showQrModal: true,
      qrModalOptions: {
        // Restrict the modal to ONLY display MetaMask and Trust Wallet
        featuredWalletIds: [
          'c57ca0a7e4ee5166b58814b8a258102ec693e20d15114cf67dec0f7402976703', // MetaMask ID
          '4622a433d00d1d2875a6001474ee27c88b3b955fcd0'  // Trust Wallet ID
        ],
        // Completely disable the "View All/Search" explorer button to make loading instant
        enableExplorer: false 
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});