<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'author_id',
        'author_name',
        'title',
        'body',
        'type',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
