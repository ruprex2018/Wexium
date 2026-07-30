<?php

namespace App\Http\Controllers;

use App\Models\KycVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KycController extends Controller
{
    /**
     * Display the KYC page with current status and historical details.
     */
    public function index()
    {
        $user = Auth::user();
        $kycRequest = $user->kycVerification()->latest()->first();

        return Inertia::render('Kyc/Index', [
            'kycStatus' => $user->kyc_status,
            'kycRequest' => $kycRequest,
        ]);
    }

    /**
     * Store and process a user's KYC documents.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Prevent users with pending/approved status from submitting duplicates
        if (in_array($user->kyc_status, ['pending', 'approved'])) {
            return redirect()->back()->withErrors(['error' => 'You already have an active or approved KYC verification request.']);
        }

        $request->validate([
            'document_type' => 'required|string|in:passport,national_id,drivers_license',
            'document_number' => 'required|string|max:50',
            'front_image' => 'required|image|mimes:jpeg,png,jpg|max:4096', // Max 4MB
            'back_image' => 'nullable|image|mimes:jpeg,png,jpg|max:4096',
            'selfie_image' => 'nullable|image|mimes:jpeg,png,jpg|max:4096',
        ]);

        // Process file uploads securely
        $frontPath = $request->file('front_image')->store('kyc', 'public');
        $backPath = $request->hasFile('back_image') ? $request->file('back_image')->store('kyc', 'public') : null;
        $selfiePath = $request->hasFile('selfie_image') ? $request->file('selfie_image')->store('kyc', 'public') : null;

        // Create the verification record
        KycVerification::create([
            'user_id' => $user->id,
            'document_type' => $request->document_type,
            'document_number' => $request->document_number,
            'front_image' => $frontPath,
            'back_image' => $backPath,
            'selfie_image' => $selfiePath,
            'status' => 'pending',
        ]);

        // Set user's base KYC status to pending
        $user->update([
            'kyc_status' => 'pending',
            'kyc_rejection_reason' => null
        ]);

        return redirect()->back()->with('success', 'KYC documents uploaded successfully. They are now pending admin review.');
    }

    /**
     * Simulate Admin Decision (Approve/Reject).
     */
    public function processDecision(Request $request, KycVerification $kyc)
    {
        $request->validate([
            'decision' => 'required|string|in:approved,rejected',
            'rejection_reason' => 'required_if:decision,rejected|nullable|string|max:500',
        ]);

        $status = $request->decision;
        $reason = $request->rejection_reason;

        // 1. Update the KYC verification record
        $kyc->update([
            'status' => $status,
            'rejection_reason' => $reason,
        ]);

        // 2. Synchronize status directly to the user's account profile
        $user = User::findOrFail($kyc->user_id);
        $user->update([
            'kyc_status' => $status,
            'kyc_rejection_reason' => $reason
        ]);

        return redirect()->back()->with('success', "KYC request updated to: " . strtoupper($status));
    }
}