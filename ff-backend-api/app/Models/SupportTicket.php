<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasUuid;

    protected $table = 'support_tickets';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['userId', 'subject', 'message', 'status', 'priority', 'replies'];
    protected $casts = ['replies' => 'array'];

    public function getCreatedAtColumn() { return 'createdAt'; }
    public function getUpdatedAtColumn() { return 'updatedAt'; }

    public function messages()
    {
        return $this->hasMany(SupportMessage::class, 'ticketId')->orderBy('created_at');
    }
}
