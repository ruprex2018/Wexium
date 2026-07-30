<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StakingPool extends Model
{
    protected $fillable = [
        'name',
        'currency_code',
        'apy',
        'lock_period_days',
        'min_stake',
        'max_stake',
        'capacity',
        'total_staked',
    ];

    public function stakes(): HasMany
    {
        return $this->hasMany(Stake::class);
    }
}