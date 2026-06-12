<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use App\Models\Tournament;
use App\Models\TournamentRegistration;
use App\Models\User;
use App\Models\TournamentLineupMember;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    public function index(Request $request)
    {
        if (in_array($request->user()->role, [User::ROLE_ADMIN, User::ROLE_ORGANIZER])) {
            $query = MatchModel::with('tournament.game');
            if ($request->user()->role === User::ROLE_ORGANIZER) {
                $query->whereHas('tournament', fn ($q) => $q->where('organizerId', $request->user()->id));
            }
            return response()->json($query->orderBy('scheduledTime')->get());
        }
        return $this->myMatches($request);
    }

    public function myMatches(Request $request)
    {
        $ids = TournamentRegistration::where('status', TournamentRegistration::STATUS_APPROVED)
            ->where(fn ($q) => $q->where('userId', $request->user()->id)
                ->orWhereHas('lineup.members', fn ($members) => $members->where('userId', $request->user()->id)))
            ->pluck('tournamentId');
        return response()->json(MatchModel::with('tournament.game')->whereIn('tournamentId', $ids)->orderBy('scheduledTime')->get()->map(fn ($match) => $this->serializeForPlayer($request, $match)));
    }

    public function byTournament(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        $this->authorizeView($request, $tournament);
        return response()->json(MatchModel::with('tournament.game')->where('tournamentId', $id)->orderBy('matchNumber')->get()->map(fn ($match) => $this->serializeForViewer($request, $match)));
    }

    public function show(Request $request, $id)
    {
        $match = MatchModel::with('tournament.game')->findOrFail($id);
        $this->authorizeView($request, $match->tournament);
        return response()->json($this->serializeForViewer($request, $match));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tournamentId' => 'required|exists:tournaments,id', 'matchNumber' => 'required|integer',
            'stage' => 'required|string', 'map' => 'required|string', 'scheduledTime' => 'required|date',
            'roomId' => 'nullable|string', 'roomPassword' => 'nullable|string',
        ]);
        $tournament = Tournament::findOrFail($data['tournamentId']);
        abort_unless($request->user()->role === User::ROLE_ADMIN || $tournament->organizerId === $request->user()->id, 403);
        $match = MatchModel::create($data)->load('tournament');
        $this->notifyRoomReady($match);
        return response()->json($match, 201);
    }

    public function update(Request $request, $id)
    {
        $match = MatchModel::with('tournament')->findOrFail($id);
        abort_unless($request->user()->role === User::ROLE_ADMIN || $match->tournament->organizerId === $request->user()->id, 403);
        $data = $request->validate([
            'matchNumber' => 'sometimes|integer|min:1',
            'stage' => 'sometimes|string|max:255',
            'map' => 'sometimes|string|max:255',
            'scheduledTime' => 'sometimes|date',
            'status' => 'sometimes|in:SCHEDULED,IN_PROGRESS,COMPLETED,CANCELLED',
            'roomId' => 'nullable|string|max:255',
            'roomPassword' => 'nullable|string|max:255',
            'results' => 'sometimes|array',
        ]);
        $match->update($data);
        $this->notifyRoomReady($match->fresh('tournament'));
        return response()->json($match->fresh('tournament'));
    }

    public function rooms(Request $request)
    {
        $query = MatchModel::with('tournament')->whereNotNull('roomId');
        if ($request->tournamentId) {
            $query->where('tournamentId', $request->tournamentId);
        }
        if ($request->user()->role === User::ROLE_ORGANIZER) {
            $query->whereHas('tournament', fn ($q) => $q->where('organizerId', $request->user()->id));
        }
        return response()->json($query->orderBy('scheduledTime')->get()->map(fn ($match) => [
            ...$match->toArray(), 'tournamentName' => $match->tournament?->title,
            'format' => $match->tournament?->format, 'password' => $match->roomPassword,
        ]));
    }

    public function updateRoom(Request $request, $id)
    {
        $match = MatchModel::with('tournament')->findOrFail($id);
        abort_unless($request->user()->role === User::ROLE_ADMIN || $match->tournament->organizerId === $request->user()->id, 403);
        $data = $request->validate(['roomId' => 'nullable|string|max:255', 'password' => 'nullable|string|max:255']);
        $match->update(['roomId' => $data['roomId'] ?? $match->roomId, 'roomPassword' => $data['password'] ?? $match->roomPassword]);
        $this->notifyRoomReady($match->fresh('tournament'));
        return response()->json($match);
    }

    private function authorizeView(Request $request, Tournament $tournament): void
    {
        $allowed = $request->user()->role === User::ROLE_ADMIN
            || $tournament->organizerId === $request->user()->id
            || TournamentRegistration::where('tournamentId', $tournament->id)->where('status', TournamentRegistration::STATUS_APPROVED)
                ->where(fn ($q) => $q->where('userId', $request->user()->id)
                    ->orWhereHas('lineup.members', fn ($members) => $members->where('userId', $request->user()->id)))->exists();
        abort_unless($allowed, 403);
    }

    private function serializeForViewer(Request $request, MatchModel $match): array
    {
        if ($request->user()->role === User::ROLE_ADMIN || $match->tournament->organizerId === $request->user()->id) return $match->toArray();
        return $this->serializeForPlayer($request, $match);
    }

    private function serializeForPlayer(Request $request, MatchModel $match): array
    {
        $data = [...$match->toArray(), 'tournamentName' => $match->tournament?->title, 'format' => $match->tournament?->format];
        $registration = TournamentRegistration::where('tournamentId', $match->tournamentId)->where('status', TournamentRegistration::STATUS_APPROVED)
            ->where(fn ($q) => $q->where('userId', $request->user()->id)->orWhereHas('lineup.members', fn ($members) => $members->where('userId', $request->user()->id)))->first();
        if (!$registration || ($match->tournament?->checkInEnabled && $registration->checkInStatus !== 'CHECKED_IN')) {
            $data['roomId'] = null;
            $data['roomPassword'] = null;
        }
        return $data;
    }

    private function notifyRoomReady(MatchModel $match): void
    {
        if (!$match->roomId) return;
        $fingerprint = sha1($match->roomId.'|'.$match->roomPassword);
        $this->notifications->sendMany(
            $this->notifications->tournamentParticipantIds($match->tournament),
            'ROOM_AVAILABLE',
            'Match lobby is ready',
            'Private lobby details are available for '.$match->tournament->title.'.',
            ['tournamentId' => $match->tournamentId, 'matchId' => $match->id],
            'match-room-ready:'.$match->id.':'.$fingerprint,
        );
    }
}
