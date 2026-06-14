<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['Engineering', 'Karim El Idrissi',  52, 49, '#4E6BA6'],
            ['Finance',     'Nadia Benjelloun',  38, 37, '#2E7D5B'],
            ['Product',     'Salma Ait Ouarab',  24, 24, '#6B5EA8'],
            ['Marketing',   'Houda Tazi',        31, 30, '#8B5E3C'],
            ['Sales',       'Mehdi Berrada',     45, 44, '#B4862F'],
            ['Operations',  'Hicham Kamani',     28, 27, '#3C6B8B'],
            ['HR',          'F.Z. Alami',        12, 12, '#7B5EA8'],
            ['Legal',       'Omar Benali',       17, 17, '#4A7C6B'],
        ];

        foreach ($departments as [$name, $head, $count, $active, $color]) {
            Department::create(compact('name', 'head', 'count', 'active', 'color'));
        }
    }
}
