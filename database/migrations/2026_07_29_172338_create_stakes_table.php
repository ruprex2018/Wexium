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
        Schema::create('stakes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('staking_pool_id')->constrained()->onDelete('cascade');
            
            $table->decimal('amount', 36, 18);
            $table->decimal('apy', 5, 2); // Locks in the APY at the moment of staking
            
            $table->string('status')->default('active'); // active, claimed
            
            $table->dateTime('staked_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stakes');
    }
};
