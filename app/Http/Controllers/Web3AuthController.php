<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Elliptic\EC;
use kornrunner\Keccak;

class Web3AuthController extends Controller
{
    /**
     * Generate a cryptographic nonce for the session.
     */
    public function getNonce(Request $request)
    {
        $nonce = Str::random(16);
        $request->session()->put('web3_nonce', $nonce);

        return response()->json([
            'nonce' => $nonce,
            'message' => "Sign this message to authenticate with Metastake. Nonce: " . $nonce
        ]);
    }

    /**
     * Verify the signature and authenticate the user.
     */
    public function verifySignature(Request $request)
    {
        $request->validate([
            'address' => 'required|string',
            'signature' => 'required|string',
        ]);

        $address = strtolower($request->address);
        $signature = $request->signature;
        
        $nonce = $request->session()->get('web3_nonce');
        if (!$nonce) {
            return response()->json(['error' => 'Session expired. Please try again.'], 422);
        }

        $message = "Sign this message to authenticate with Metastake. Nonce: " . $nonce;

        if (!$this->verifyEthereumSignature($message, $signature, $address)) {
            return response()->json(['error' => 'Invalid cryptographic signature.'], 422);
        }

        $request->session()->forget('web3_nonce');

        // Find or create the user
        $user = User::where('wallet_address', $address)->first();

        if (!$user) {
            // Retrieve and clear the captured referral code from the session
            $referredByCode = $request->session()->pull('referred_by_code');
            $referrer = $referredByCode ? User::where('referral_code', $referredByCode)->first() : null;

            $user = User::create([
                'wallet_address' => $address,
                'name' => 'Web3 User ' . substr($address, 0, 6),
                'referred_by' => $referrer ? $referrer->id : null,
                // (Note: referral_code is generated automatically via our User model booted hook)
            ]);

            // Create default native wallets (e.g., USDT, ETH)
            Wallet::create(['user_id' => $user->id, 'currency_code' => 'USDT', 'balance' => 0]);
            Wallet::create(['user_id' => $user->id, 'currency_code' => 'ETH', 'balance' => 0]);
        }

        // Log the user in
        Auth::login($user, true);

        return response()->json(['success' => true, 'redirect' => route('dashboard')]);
    }

    /**
     * Cryptographic utility to verify Ethereum personal_sign signatures.
     */
    private function verifyEthereumSignature(string $message, string $signature, string $address): bool
    {
        $msgLength = strlen($message);
        $ethMessage = "\x19Ethereum Signed Message:\n" . $msgLength . $message;
        
        $messageHash = Keccak::hash($ethMessage, 256);

        if (strlen($signature) !== 132) {
            return false;
        }

        $r = substr($signature, 2, 64);
        $s = substr($signature, 66, 64);
        $v = hexdec(substr($signature, 130, 2));

        $recoveryId = $v - 27;
        if ($recoveryId < 0 || $recoveryId > 3) {
            $recoveryId = $v; 
        }

        $ec = new EC('secp256k1');
        
        try {
            $pubKey = $ec->recoverPubKey(
                $messageHash, 
                ['r' => $r, 's' => $s], 
                $recoveryId
            );
            
            $pubKeyHex = $pubKey->encode('hex');
            
            $pubKeyBytes = hex2bin(substr($pubKeyHex, 2));
            $derivedAddress = '0x' . substr(Keccak::hash($pubKeyBytes, 256), -40);
            
            return strtolower($derivedAddress) === strtolower($address);
        } catch (\Exception $e) {
            return false;
        }
    }
}