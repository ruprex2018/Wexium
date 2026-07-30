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
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The affiliate earning the commission
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade'); // The referred user who triggered the event
            
            $table->decimal('amount', 36, 18); // Earning amount
            $table->string('currency_code', 10);
            
            $table->integer('level'); // 1, 2, or 3
            $table->string('description'); // e.g., "Level 1 Commission from Staking"
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
