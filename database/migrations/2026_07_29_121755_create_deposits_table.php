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
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('currency_code', 10); // e.g., 'USDT', 'ETH'
            
            // Supporting high precision decimal balances
            $table->decimal('amount', 36, 18);
            
            $table->string('payment_method')->default('crypto'); // crypto, manual_qr, bank_transfer
            $table->string('tx_hash')->nullable(); // Blockchain tx hash or reference number
            $table->string('proof_file')->nullable(); // Path to the uploaded receipt/screenshot image
            
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('admin_feedback')->nullable(); // Reason for approval/rejection
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deposits');
    }
};
