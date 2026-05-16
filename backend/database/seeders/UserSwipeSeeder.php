<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\User;
use App\Models\UserCarLike;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Seeds realistic demo swipe history so the admin dashboard shows actual
 * reports (top brand/model/type, distributions, activity feed) on first run.
 * Without this, both seeded users would have zero swipes and the per-user
 * page would only show the empty state.
 */
class UserSwipeSeeder extends Seeder
{
    public function run(): void
    {
        $demo = User::where('email', 'user@mobeecars.test')->first();
        if (!$demo) return;

        $cars = Car::all()->keyBy(fn ($c) => $c->brand . '|' . $c->model);

        // Pattern: Demo User favours Toyota + Honda sedans/SUVs, skips coupes and pickups.
        $script = [
            ['Toyota',  'Vios 1.5G',           true],
            ['Toyota',  'Camry 2.5V',          true],
            ['Toyota',  'Corolla Cross 1.8',   true],
            ['Toyota',  'Hilux Rogue 2.8',     false],
            ['Toyota',  'Alphard Executive',   true],
            ['Honda',   'City RS e:HEV',       true],
            ['Honda',   'Civic RS Turbo',      true],
            ['Honda',   'CR-V 1.5 TC-P',       true],
            ['Honda',   'Jazz V',              false],
            ['Perodua', 'Myvi 1.5 AV',         false],
            ['Perodua', 'Bezza 1.3 AV',        true],
            ['Proton',  'X50 Flagship',        true],
            ['Proton',  'X70 Premium',         true],
            ['Proton',  'Saga Premium S',      false],
            ['BMW',     '320i M Sport',        true],
            ['BMW',     'X3 xDrive30i',        true],
            ['BMW',     '218i Gran Coupe',     false],
            ['Mazda',   'CX-5 2.0 GLS',        true],
            ['Ford',    'Ranger Wildtrak 2.0', false],
            ['Audi',    'A4 2.0 TFSI',         true],
        ];

        $base = Carbon::now()->subDays(3);
        foreach ($script as $i => [$brand, $model, $liked]) {
            $car = $cars["$brand|$model"] ?? null;
            if (!$car) continue;

            UserCarLike::create([
                'user_id'   => $demo->id,
                'car_id'    => $car->id,
                'liked'     => $liked,
                'swiped_at' => $base->copy()->addMinutes($i * 7),
            ]);
        }
    }
}
