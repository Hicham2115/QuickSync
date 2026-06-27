<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Training extends Model
{
    protected $fillable = ['employee_id', 'name', 'provider', 'started_at', 'completed_at', 'expiry_date', 'status', 'notes'];

    protected $casts = [
        'started_at'   => 'date',
        'completed_at' => 'date',
        'expiry_date'  => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
