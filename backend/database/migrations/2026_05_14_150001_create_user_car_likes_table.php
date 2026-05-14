<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_car_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->boolean('liked');
            $table->timestamp('swiped_at');
            $table->timestamps();

            $table->unique(['user_id', 'car_id']);
            $table->index(['user_id', 'liked']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_car_likes');
    }
};
