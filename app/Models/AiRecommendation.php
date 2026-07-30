<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiRecommendation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'recommendation',
    ];

    /**
     * Get the user that owns the recommendation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}