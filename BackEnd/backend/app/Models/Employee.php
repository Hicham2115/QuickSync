<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = ['name', 'email', 'dept', 'title', 'hired', 'status', 'leaves', 'phone', 'bio', 'salary'];

    protected $casts = [
        'hired'  => 'date:d M Y',
        'leaves' => 'integer',
        'salary' => 'float',
    ];

    public function promotions()
    {
        return $this->hasMany(Promotion::class)->orderByDesc('promoted_at');
    }

    public function trainings()
    {
        return $this->hasMany(Training::class)->orderByDesc('started_at');
    }
}
