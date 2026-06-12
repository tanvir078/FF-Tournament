<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class SupportMessage extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['ticketId', 'senderId', 'message', 'readAt'];
    protected $casts = ['readAt' => 'datetime'];

    public function sender() { return $this->belongsTo(User::class, 'senderId'); }
}
