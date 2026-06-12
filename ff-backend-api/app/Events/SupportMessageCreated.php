<?php

namespace App\Events;

use App\Models\SupportMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportMessageCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public SupportMessage $message) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('support.ticket.'.$this->message->ticketId)];
    }

    public function broadcastAs(): string
    {
        return 'support.message.created';
    }
}
