<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deposit extends Model
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
        'payment_method',
        'tx_hash',
        'proof_file',
        'status',
        'admin_feedback',
    ];

    /**
     * Get the user that owns the deposit.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}