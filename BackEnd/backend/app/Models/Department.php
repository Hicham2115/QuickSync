<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'head', 'count', 'active', 'color'];

    protected $casts = [
        'count'  => 'integer',
        'active' => 'integer',
    ];
}
