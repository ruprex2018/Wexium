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
        Schema::create('p2p_trades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('p2p_offer_id')->constrained()->onDelete('cascade');
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            
            $table->decimal('amount', 36, 18);
            $table->decimal('total_price', 16, 2); // amount * price_per_unit
            
            $table->string('status')->default('pending_payment'); // pending_payment, paid, completed, disputed, cancelled
            $table->string('payment_proof_file')->nullable();
            
            $table->text('dispute_reason')->nullable();
            $table->foreignId('disputed_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('p2p_trades');
    }
};
