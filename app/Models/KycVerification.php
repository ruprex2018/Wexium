<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycVerification extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'document_type',
        'document_number',
        'front_image',
        'back_image',
        'selfie_image',
        'status',
        'rejection_reason',
    ];

    /**
     * Get the user associated with this verification request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}