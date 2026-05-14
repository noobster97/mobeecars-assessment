<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCarLike extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_id',
        'liked',
        'swiped_at',
    ];

    protected function casts(): array
    {
        return [
            'liked' => 'boolean',
            'swiped_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
