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
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('currency_code', 10); // USDT, ETH
            
            $table->decimal('amount', 36, 18);
            $table->string('wallet_address'); // Destination address details
            
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('admin_feedback')->nullable(); // Rejection reason or transaction ID
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};
