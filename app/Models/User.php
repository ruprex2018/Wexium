<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'wallet_address',
        'kyc_status',
        'kyc_rejection_reason',
        'referral_code',
        'referred_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the wallets associated with the user.
     */
    public function wallets(): HasMany
    {
        return $this->hasMany(Wallet::class);
    }

    /**
     * Get the deposits associated with the user.
     */
    public function deposits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    /**
     * Get the active stakes associated with the user.
     */
    public function stakes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Stake::class);
    }

    /**
     * Get the KYC verification request for this user.
     */
    public function kycVerification(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(KycVerification::class);
    }

    public function p2pOffers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(P2pOffer::class);
    }

    public function buyTrades(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(P2pTrade::class, 'buyer_id');
    }

    public function sellTrades(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(P2pTrade::class, 'seller_id');
    }

    /**
     * Get the AI recommendations generated for this user.
     */
    public function aiRecommendations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AiRecommendation::class);
    }

    /**
     * Get the withdrawals requested by this user.
     */
    public function withdrawals(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    /**
     * Get the immediate referrers (Sponsor).
     */
    public function referrer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    /**
     * Get Level 1 referrals (Direct).
     */
    public function referrals(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    /**
     * Get commissions earned by this user.
     */
    public function commissions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Commission::class);
    }

    /**
     * The "booted" method of the model.
     * Automatically runs during model creation lifecycle.
     */
    protected static function booted()
    {
        static::creating(function ($user) {
            if (empty($user->referral_code)) {
                $user->referral_code = \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
            }
        });
    }

    /**
     * Get the support tickets submitted by this user.
     */
    public function supportTickets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }
}