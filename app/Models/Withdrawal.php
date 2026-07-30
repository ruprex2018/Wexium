<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'currency_code',
        'amount',
        'wallet_address',
        'status',
        'admin_feedback',
    ];

    /**
     * Get the user that owns the withdrawal.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}