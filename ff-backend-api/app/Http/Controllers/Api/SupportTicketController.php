<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Events\SupportMessageCreated;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with('messages.sender')->orderByDesc('createdAt');
        if ($request->user()->role !== User::ROLE_ADMIN) $query->where('userId', $request->user()->id);
        return response()->json($query->get()->map(fn (SupportTicket $ticket) => $this->serialize($ticket, $request->user())));
    }

    public function settings()
    {
        return response()->json(DB::table('support_settings')->first() ?? ['telegramUrl' => null, 'whatsappUrl' => null]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate(['telegramUrl' => 'nullable|url', 'whatsappUrl' => 'nullable|url']);
        DB::table('support_settings')->updateOrInsert(['id' => 1], [...$data, 'updated_at' => now(), 'created_at' => now()]);
        return $this->settings();
    }

    public function store(Request $request)
    {
        $data = $request->validate(['subject' => 'required|string', 'message' => 'required|string', 'priority' => 'nullable|string']);
        $ticket = DB::transaction(function () use ($data, $request) {
            $ticket = SupportTicket::create(['subject' => $data['subject'], 'priority' => $data['priority'] ?? 'MEDIUM', 'message' => $data['message'], 'userId' => $request->user()->id]);
            SupportMessageCreated::dispatch(SupportMessage::create(['ticketId' => $ticket->id, 'senderId' => $request->user()->id, 'message' => $data['message']]));
            return $ticket;
        });
        return response()->json($this->serialize($ticket->load('messages.sender'), $request->user()), 201);
    }

    public function reply(Request $request, $id)
    {
        $data = $request->validate(['message' => 'required|string']);
        $ticket = SupportTicket::findOrFail($id);
        $isManager = $request->user()->role === User::ROLE_ADMIN;
        abort_unless($isManager || $ticket->userId === $request->user()->id, 403);
        SupportMessageCreated::dispatch(SupportMessage::create(['ticketId' => $ticket->id, 'senderId' => $request->user()->id, 'message' => $data['message']]));
        if ($isManager && $ticket->status === 'OPEN') $ticket->update(['status' => 'IN_PROGRESS']);
        return response()->json($this->serialize($ticket->fresh()->load('messages.sender'), $request->user()));
    }

    public function markRead(Request $request, $id)
    {
        $ticket = SupportTicket::with('messages.sender')->findOrFail($id);
        abort_unless($request->user()->role === User::ROLE_ADMIN || $ticket->userId === $request->user()->id, 403);
        $ticket->messages()->where('senderId', '!=', $request->user()->id)->whereNull('readAt')->update(['readAt' => now()]);
        return response()->json($this->serialize($ticket->fresh()->load('messages.sender'), $request->user()));
    }

    private function serialize(SupportTicket $ticket, User $viewer): array
    {
        $ticket->loadMissing('messages.sender');
        return [
            ...$ticket->toArray(),
            'unreadCount' => $ticket->messages
                ->where('senderId', '!=', $viewer->id)
                ->whereNull('readAt')
                ->count(),
            'replies' => $ticket->messages->map(fn (SupportMessage $message) => [
                'id' => $message->id,
                'message' => $message->message,
                'isAdmin' => $message->sender?->role === User::ROLE_ADMIN,
                'readAt' => $message->readAt,
                'createdAt' => $message->created_at,
            ])->values(),
        ];
    }
}
