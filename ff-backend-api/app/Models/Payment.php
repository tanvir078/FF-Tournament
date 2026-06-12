<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasUuid;

    protected $table = 'payments';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['userId', 'tournamentId', 'transactionId', 'amount', 'currency', 'status', 'screenshotPath'];

    public function getCreatedAtColumn() { return 'createdAt'; }
    public function getUpdatedAtColumn() { return 'updatedAt'; }
}
