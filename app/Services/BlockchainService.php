<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class BlockchainService
{
    protected $rpcUrl;

    public function __construct()
    {
        // Define your EVM RPC Node in your .env (Defaults to Sepolia public node)
        $this->rpcUrl = env('RPC_NODE_URL', 'https://ethereum-sepolia-rpc.publicnode.com');
    }

    /**
     * Verify a native blockchain transaction (e.g., ETH) on-chain.
     * Verifies sender, receiver, success status, and exact value before approving.
     */
    public function verifyTransaction(string $txHash, string $expectedFrom, string $expectedTo, float $expectedAmount): bool
    {
        try {
            // 1. Fetch transaction details by its hash
            $response = Http::post($this->rpcUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_getTransactionByHash',
                'params' => [$txHash],
                'id' => 1
            ]);

            if (!$response->successful() || empty($response->json('result'))) {
                return false;
            }

            $tx = $response->json('result');

            // Verify the recipient matches our official smart contract/wallet address
            if (strtolower($tx['to']) !== strtolower($expectedTo)) {
                return false;
            }

            // Verify the sender matches the user's logged-in wallet address
            if (strtolower($tx['from']) !== strtolower($expectedFrom)) {
                return false;
            }

            // 2. Fetch the transaction receipt to verify execution success
            $receiptResponse = Http::post($this->rpcUrl, [
                'jsonrpc' => '2.0',
                'method' => 'eth_getTransactionReceipt',
                'params' => [$txHash],
                'id' => 1
            ]);

            if (!$receiptResponse->successful() || empty($receiptResponse->json('result'))) {
                return false;
            }

            $receipt = $receiptResponse->json('result');

            // Status '0x1' indicates successful execution on the EVM
            if ($receipt['status'] !== '0x1') {
                return false;
            }

            // 3. Verify the value sent (Convert hex Wei to Ether)
            $valueHex = $tx['value'];
            $valueWei = hexdec(substr($valueHex, 2));
            $valueEth = $valueWei / 10**18;

            // Allow standard float tolerance
            if (abs($valueEth - $expectedAmount) > 0.00001) {
                return false;
            }

            return true;

        } catch (\Exception $e) {
            logger()->error("On-Chain Verification Exception: " . $e->getMessage());
            return false;
        }
    }
}