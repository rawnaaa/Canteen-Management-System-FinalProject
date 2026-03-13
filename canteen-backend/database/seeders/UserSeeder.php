<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account
        User::firstOrCreate(
            ['email' => 'admin@canteen.com'],
            [
                'name'     => 'Admin User',
                'password' => Hash::make('password'),
                'role'     => 'admin',
                'is_active' => true,
            ]
        );

        // Cashier account
        User::firstOrCreate(
            ['email' => 'cashier@canteen.com'],
            [
                'name'     => 'Cashier User',
                'password' => Hash::make('password'),
                'role'     => 'cashier',
                'is_active' => true,
            ]
        );

        // Sample customers
        $customers = [
            ['name' => 'Juan Dela Cruz',   'email' => 'juan@student.edu'],
            ['name' => 'Maria Santos',     'email' => 'maria@student.edu'],
            ['name' => 'Pedro Reyes',      'email' => 'pedro@student.edu'],
            ['name' => 'Ana Garcia',       'email' => 'ana@student.edu'],
            ['name' => 'Jose Mendoza',     'email' => 'jose@student.edu'],
        ];

        foreach ($customers as $customer) {
            User::firstOrCreate(
                ['email' => $customer['email']],
                [
                    'name'      => $customer['name'],
                    'password'  => Hash::make('password'),
                    'role'      => 'customer',
                    'is_active' => true,
                ]
            );
        }
    }
}