<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Demo User',
            'email'    => 'user@mobeecars.test',
            'password' => Hash::make('password'),
            'is_admin' => false,
        ]);

        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@mobeecars.test',
            'password' => Hash::make('password'),
            'is_admin' => true,
        ]);

        $this->call(CarSeeder::class);
        $this->call(UserSwipeSeeder::class);
    }
}
