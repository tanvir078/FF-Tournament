<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\SupportTicket;
use App\Models\User;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('support.ticket.{id}', function (User $user, string $id) {
    $ticket = SupportTicket::find($id);
    return $ticket && ($ticket->userId === $user->id || $user->role === User::ROLE_ADMIN);
});
