<?php

namespace Database\Seeders;

use App\Models\Car;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    /**
     * Curated Unsplash photo IDs grouped by car type. All verified to return 200.
     * If any visually mismatches (Unsplash photos can be ambiguous), swap the ID
     * for another from the verified pool — the seeder structure stays the same.
     */
    private const PHOTOS_BY_TYPE = [
        'SUV' => [
            '1494905998402-395d579af36f',
            '1580273916550-e323be2ae537',
            '1606664515524-ed2f786a0bd6',
            '1611859266238-4b98091d9d9b',
            '1543854589-fdd815f176e0',
        ],
        'Sedan' => [
            '1494976388531-d1058494cdd8',
            '1606220945770-b5b6c2c55bf1',
            '1583121274602-3e2820c69888',
            '1517524008697-84bbe3c3fd98',
            '1612825173281-9a193378527e',
            '1503736334956-4c8f8e92946d',
        ],
        'Hatchback' => [
            '1568844293986-8d0400bd4745',
            '1565043666747-69f6646db940',
            '1551830820-330a71b99659',
        ],
        'MPV' => [
            '1502877338535-766e1452684a',
            '1580414057403-c5f451f30e1c',
        ],
        'Pickup' => [
            '1605559424843-9e4c228bf1c2',
            '1593941707874-ef25b8b4a92b',
        ],
        'Coupe' => [
            '1542362567-b07e54358753',
            '1552519507-da3b142c6e3d',
            '1503376780353-7e6692767b70',
            '1492144534655-ae79c964c9d7',
        ],
    ];

    private const INVENTORY = [
        // Toyota (5)
        ['brand' => 'Toyota', 'model' => 'Vios 1.5G',          'type' => 'Sedan'],
        ['brand' => 'Toyota', 'model' => 'Camry 2.5V',         'type' => 'Sedan'],
        ['brand' => 'Toyota', 'model' => 'Hilux Rogue 2.8',    'type' => 'Pickup'],
        ['brand' => 'Toyota', 'model' => 'Alphard Executive',  'type' => 'MPV'],
        ['brand' => 'Toyota', 'model' => 'Corolla Cross 1.8',  'type' => 'SUV'],

        // Honda (4)
        ['brand' => 'Honda', 'model' => 'City RS e:HEV',       'type' => 'Sedan'],
        ['brand' => 'Honda', 'model' => 'Civic RS Turbo',      'type' => 'Sedan'],
        ['brand' => 'Honda', 'model' => 'CR-V 1.5 TC-P',       'type' => 'SUV'],
        ['brand' => 'Honda', 'model' => 'Jazz V',              'type' => 'Hatchback'],

        // Perodua (4)
        ['brand' => 'Perodua', 'model' => 'Myvi 1.5 AV',       'type' => 'Hatchback'],
        ['brand' => 'Perodua', 'model' => 'Bezza 1.3 AV',      'type' => 'Sedan'],
        ['brand' => 'Perodua', 'model' => 'Axia 1.0 SE',       'type' => 'Hatchback'],
        ['brand' => 'Perodua', 'model' => 'Aruz 1.5 AV',       'type' => 'SUV'],

        // Proton (3)
        ['brand' => 'Proton', 'model' => 'X50 Flagship',       'type' => 'SUV'],
        ['brand' => 'Proton', 'model' => 'X70 Premium',        'type' => 'SUV'],
        ['brand' => 'Proton', 'model' => 'Saga Premium S',     'type' => 'Sedan'],

        // BMW (3)
        ['brand' => 'BMW', 'model' => '320i M Sport',          'type' => 'Sedan'],
        ['brand' => 'BMW', 'model' => 'X3 xDrive30i',          'type' => 'SUV'],
        ['brand' => 'BMW', 'model' => '218i Gran Coupe',       'type' => 'Coupe'],

        // Mercedes-Benz (2)
        ['brand' => 'Mercedes-Benz', 'model' => 'C200 AMG Line', 'type' => 'Sedan'],
        ['brand' => 'Mercedes-Benz', 'model' => 'GLC 300 4MATIC','type' => 'SUV'],

        // Mazda (2)
        ['brand' => 'Mazda', 'model' => 'CX-5 2.0 GLS',        'type' => 'SUV'],
        ['brand' => 'Mazda', 'model' => 'CX-30 2.0 Mid',       'type' => 'SUV'],

        // Hyundai (2)
        ['brand' => 'Hyundai', 'model' => 'Tucson 2.0 Elegance','type' => 'SUV'],
        ['brand' => 'Hyundai', 'model' => 'Elantra 1.6',       'type' => 'Sedan'],

        // Nissan (2)
        ['brand' => 'Nissan', 'model' => 'Almera VLT Turbo',   'type' => 'Sedan'],
        ['brand' => 'Nissan', 'model' => 'X-Trail 2.5 4WD',    'type' => 'SUV'],

        // Audi (1)
        ['brand' => 'Audi', 'model' => 'A4 2.0 TFSI',          'type' => 'Sedan'],

        // Ford (1)
        ['brand' => 'Ford', 'model' => 'Ranger Wildtrak 2.0',  'type' => 'Pickup'],

        // Volkswagen (1)
        ['brand' => 'Volkswagen', 'model' => 'Tiguan Allspace','type' => 'SUV'],
    ];

    public function run(): void
    {
        // Per-type cursor so cars within the same type rotate through their photo pool.
        $cursors = array_fill_keys(array_keys(self::PHOTOS_BY_TYPE), 0);

        foreach (self::INVENTORY as $car) {
            $pool = self::PHOTOS_BY_TYPE[$car['type']];
            $photoId = $pool[$cursors[$car['type']] % count($pool)];
            $cursors[$car['type']]++;

            Car::create([
                'brand'     => $car['brand'],
                'model'     => $car['model'],
                'type'      => $car['type'],
                'image_url' => "https://images.unsplash.com/photo-{$photoId}?w=800&q=80&auto=format&fit=crop",
            ]);
        }
    }
}
