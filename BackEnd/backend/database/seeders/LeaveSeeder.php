<?php

namespace Database\Seeders;

use App\Models\Leave;
use Illuminate\Database\Seeder;

class LeaveSeeder extends Seeder
{
    public function run(): void
    {
        $leaves = [
            ['Nadia Benjelloun',   'Finance',     'Annuel',     '2026-06-10', '2026-06-14', 5, 'en_attente', 'Vacances familiales'],
            ['Karim El Idrissi',   'Engineering', 'Maladie',    '2026-06-08', '2026-06-09', 2, 'approuve',   'Arrêt médical'],
            ['Salma Ait Ouarab',   'Product',     'Annuel',     '2026-06-15', '2026-06-20', 6, 'approuve',   'Voyage personnel'],
            ['Youssef Mansouri',   'Sales',       'Sans solde', '2026-07-01', '2026-07-05', 5, 'refuse',     'Démarche personnelle'],
            ['Houda Tazi',         'Marketing',   'Annuel',     '2026-06-18', '2026-06-22', 5, 'en_attente', 'Congé annuel'],
            ['Hicham Kamani',      'Operations',  'Annuel',     '2026-06-25', '2026-07-02', 8, 'en_attente', 'Mariage familial'],
            ['Omar Benali',        'Engineering', 'Maladie',    '2026-06-03', '2026-06-05', 3, 'approuve',   'Consultation médicale'],
            ['Mehdi Berrada',      'Sales',       'Annuel',     '2026-07-07', '2026-07-11', 5, 'en_attente', 'Congé été'],
        ];

        foreach ($leaves as [$name, $dept, $type, $from, $to, $days, $status, $reason]) {
            Leave::create([
                'employee_name' => $name,
                'dept'          => $dept,
                'type'          => $type,
                'from_date'     => $from,
                'to_date'       => $to,
                'days'          => $days,
                'status'        => $status,
                'reason'        => $reason,
            ]);
        }
    }
}
