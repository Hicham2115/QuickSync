<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('employees')->insert([
            [
                'name'       => 'Nadia Benjelloun',
                'email'      => 'n.benjelloun@aurea.ma',
                'dept'       => 'Finance',
                'title'      => 'Directrice Financière',
                'hired'      => '2022-01-12',
                'status'     => 'Actif',
                'leaves'     => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Karim El Idrissi',
                'email'      => 'k.elidrissi@aurea.ma',
                'dept'       => 'Engineering',
                'title'      => 'Lead Developer',
                'hired'      => '2021-03-03',
                'status'     => 'En congé',
                'leaves'     => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Salma Ait Ouarab',
                'email'      => 's.aitouarab@aurea.ma',
                'dept'       => 'Product',
                'title'      => 'Product Manager',
                'hired'      => '2022-09-15',
                'status'     => 'Actif',
                'leaves'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Youssef Mansouri',
                'email'      => 'y.mansouri@aurea.ma',
                'dept'       => 'Sales',
                'title'      => 'Account Executive',
                'hired'      => '2023-06-01',
                'status'     => 'Actif',
                'leaves'     => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Houda Tazi',
                'email'      => 'h.tazi@aurea.ma',
                'dept'       => 'Marketing',
                'title'      => 'Chef de projet',
                'hired'      => '2022-02-20',
                'status'     => 'Actif',
                'leaves'     => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
