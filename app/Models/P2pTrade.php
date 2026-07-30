<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class P2pTrade extends Model
{
    protected $fillable = [
        'p2p_offer_id',
        'buyer_id',
        'seller_id',
        'amount',
        'total_price',
        'status',
        'payment_proof_file',
        'dispute_reason',
        'disputed_by',
    ];

    public function offer(): BelongsTo
    {
        return $this->belongsTo(P2pOffer::class, 'p2p_offer_id');
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(P2pMessage::class, 'p2p_trade_id');
    }
}