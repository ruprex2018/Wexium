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
        Schema::create('p2p_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('p2p_trade_id')->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('message');
            $table->boolean('is_system')->default(false); // To log events (e.g., "System: Buyer marked paid")
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('p2p_messages');
    }
};
