<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stake extends Model
{
    protected $fillable = [
        'user_id',
        'staking_pool_id',
        'amount',
        'apy',
        'status',
        'staked_at',
        'ends_at',
    ];

    // Cast attributes to Carbon instances automatically
    protected $casts = [
        'staked_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pool(): BelongsTo
    {
        return $this->belongsTo(StakingPool::class, 'staking_pool_id');
    }
}