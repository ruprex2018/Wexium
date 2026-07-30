<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('staking_pools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('currency_code', 10); // e.g., 'USDT', 'ETH'
            
            $table->decimal('apy', 5, 2); // e.g., 12.50 for 12.50% APY
            $table->integer('lock_period_days'); // e.g., 30, 90, 180 days
            
            $table->decimal('min_stake', 36, 18);
            $table->decimal('max_stake', 36, 18);
            $table->decimal('capacity', 36, 18)->default(0); // Maximum pool capacity
            $table->decimal('total_staked', 36, 18)->default(0); // Current total staked
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staking_pools');
    }
};
