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
        Schema::create('p2p_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            $table->enum('type', ['buy', 'sell']);
            $table->string('currency_code', 10); // USDT, ETH
            
            $table->decimal('amount', 36, 18);
            $table->decimal('price_per_unit', 16, 2); // Price in fiat (e.g. 1.00 USD)
            $table->string('payment_method'); // Bank Transfer, Paypal, Revolut
            
            $table->string('status')->default('active'); // active, inactive, completed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('p2p_offers');
    }
};
