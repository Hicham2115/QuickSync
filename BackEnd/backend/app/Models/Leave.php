<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    protected $fillable = [
        'employee_name',
        'dept',
        'type',
        'from_date',
        'to_date',
        'days',
        'status',
        'reason',
    ];

    protected $casts = [
        'from_date' => 'date',
        'to_date'   => 'date',
        'days'      => 'integer',
    ];
}
