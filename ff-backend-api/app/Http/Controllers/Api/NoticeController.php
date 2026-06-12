<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    public function index()
    {
        return response()->json(Notice::orderByDesc('isPinned')->orderByDesc('createdAt')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'type' => 'nullable|string',
            'isActive' => 'nullable|boolean',
            'isPinned' => 'nullable|boolean',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date',
            'showOnDashboard' => 'nullable|boolean',
            'showOnTournaments' => 'nullable|boolean',
            'showOnWallet' => 'nullable|boolean',
            'targetRoles' => 'nullable|array',
        ]);

        return response()->json(Notice::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $notice = Notice::findOrFail($id);
        $notice->update($request->only($notice->getFillable()));
        return response()->json($notice);
    }

    public function toggle($id)
    {
        $notice = Notice::findOrFail($id);
        $notice->update(['isActive' => !$notice->isActive]);
        return response()->json($notice);
    }

    public function pin($id)
    {
        $notice = Notice::findOrFail($id);
        $notice->update(['isPinned' => !$notice->isPinned]);
        return response()->json($notice);
    }

    public function destroy($id)
    {
        Notice::findOrFail($id)->delete();
        return response()->json(['message' => 'Notice deleted']);
    }
}
