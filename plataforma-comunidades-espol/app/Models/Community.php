<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Community extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'logo',
        'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function publications()
    {
        return $this->hasMany(Publication::class);
    }

    public function joinRequests()
    {
        return $this->hasMany(JoinRequest::class);
    }

    public function members()
    {
        return $this->belongsToMany(
            User::class,
            'memberships'
        )->withPivot('joined_at');
    }
}
