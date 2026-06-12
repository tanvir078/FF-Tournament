<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Notification::where('userId', $request->user()->id)
                ->orderByDesc('createdAt')
                ->get()
        );
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('userId', $request->user()->id)->find($id);
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->update(['isRead' => true, 'readAt' => now()]);
        return response()->json($notification);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('userId', $request->user()->id)
            ->where('isRead', false)
            ->update(['isRead' => true, 'readAt' => now()]);

        return response()->json(['message' => 'Notifications marked as read']);
    }
}
