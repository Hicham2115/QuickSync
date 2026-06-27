<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = ['employee_id', 'title', 'salary', 'previous_salary', 'promoted_at', 'notes'];

    protected $casts = [
        'promoted_at'     => 'date',
        'salary'          => 'float',
        'previous_salary' => 'float',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
