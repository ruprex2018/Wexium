<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class P2pMessage extends Model
{
    protected $fillable = [
        'p2p_trade_id',
        'sender_id',
        'message',
        'is_system',
    ];

    public function trade(): BelongsTo
    {
        return $this->belongsTo(P2pTrade::class, 'p2p_trade_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}