<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SupportTicketController extends Controller
{
    /**
     * Display a list of the user's support tickets.
     */
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Support/Index', [
            'tickets' => $user->supportTickets()->latest()->get(),
        ]);
    }

    /**
     * Store a new support ticket and create its initial thread message.
     */
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:150',
            'priority' => 'required|string|in:low,medium,high',
            'message' => 'required|string|max:2000',
        ]);

        $ticket = SupportTicket::create([
            'user_id' => Auth::id(),
            'subject' => $request->subject,
            'priority' => $request->priority,
            'status' => 'open',
        ]);

        SupportMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_id' => Auth::id(),
            'message' => $request->message,
            'is_admin' => false,
        ]);

        return redirect()->back()->with('success', 'Support ticket submitted successfully. An agent will reply shortly.');
    }

    /**
     * Display a specific support ticket's message thread.
     */
    public function show(SupportTicket $ticket)
    {
        // Enforce security boundaries: Allow only the owner OR system Administrators to view the thread
        if ($ticket->user_id !== Auth::id() && !Auth::user()->is_admin) {
            abort(403, 'Unauthorized ticket access.');
        }

        return Inertia::render('Support/Show', [
            'ticket' => $ticket,
            'messages' => $ticket->messages()->with('sender:id,name')->get(),
            'isAdmin' => (bool) Auth::user()->is_admin, // Shared globally to handle conditional rendering safely
        ]);
    }

    /**
     * Post a new message reply inside the support thread.
     */
    public function reply(Request $request, SupportTicket $ticket)
    {
        if ($ticket->user_id !== Auth::id() && !Auth::user()->is_admin) {
            abort(403, 'Unauthorized ticket action.');
        }

        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        SupportMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_id' => Auth::id(),
            'message' => $request->message,
            'is_admin' => (bool) Auth::user()->is_admin, // Flags message as admin automatically if sent by an admin
        ]);

        // Keep status as open if user replies; change to replied if admin replies
        $ticket->update([
            'status' => Auth::user()->is_admin ? 'replied' : 'open'
        ]);

        return redirect()->back();
    }

    /**
     * Handle Official Agent Responses (Admin Only).
     */
    public function simulateAgentReply(Request $request, SupportTicket $ticket)
    {
        // Enforce administrative checks
        if (!Auth::user()->is_admin) {
            abort(403, 'Unauthorized administrative action.');
        }

        $request->validate([
            'message' => 'required|string|max:2000',
            'close_ticket' => 'required|boolean',
        ]);

        SupportMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_id' => Auth::id(),
            'message' => $request->message,
            'is_admin' => true,
        ]);

        $status = $request->close_ticket ? 'closed' : 'replied';
        $ticket->update(['status' => $status]);

        return redirect()->back()->with('success', "Response processed. Ticket status updated to: " . strtoupper($status));
    }
}