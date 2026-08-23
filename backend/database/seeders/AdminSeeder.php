<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $password = env('ADMIN_INITIAL_PASSWORD', 'adminbm123');

        Admin::firstOrCreate(
            ['email' => 'admin@bm.com.br'],
            [
                'name' => 'Produtor de Conteúdo',
                'password' => $password,
            ],
        );
    }
}
