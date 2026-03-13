<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Clear existing users first
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Create admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@canteen.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '1234567890'
        ]);

        // Create cashier
        User::create([
            'name' => 'Cashier User',
            'email' => 'cashier@canteen.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
            'phone' => '1234567891'
        ]);

        // Create 10 customer accounts
        for ($i = 1; $i <= 10; $i++) {
            User::create([
                'name' => "Customer {$i}",
                'email' => "customer{$i}@canteen.com",
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '123456789' . $i
            ]);
        }
    }
}