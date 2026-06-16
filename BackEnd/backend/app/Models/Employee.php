<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = ['name', 'email', 'dept', 'title', 'hired', 'status', 'leaves', 'phone', 'bio'];

    protected $casts = [
        'hired'  => 'date:d M Y',
        'leaves' => 'integer',
    ];
}
