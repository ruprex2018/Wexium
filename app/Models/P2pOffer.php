<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class P2pOffer extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'currency_code',
        'amount',
        'price_per_unit',
        'payment_method',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trades(): HasMany
    {
        return $this->hasMany(P2pTrade::class);
    }
}