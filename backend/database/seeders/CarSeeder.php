<?php

namespace Database\Seeders;

use App\Models\Car;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    /**
     * Curated Unsplash car photo IDs. Real images, stable CDN URLs.
     * Cycled across 30 cars below.
     */
    private const PHOTOS = [
        '1494976388531-d1058494cdd8', // Mercedes black
        '1503376780353-7e6692767b70', // vintage red
        '1606220945770-b5b6c2c55bf1', // white sedan
        '1583121274602-3e2820c69888', // BMW
        '1605559424843-9e4c228bf1c2', // pickup
        '1552519507-da3b142c6e3d',    // black coupe
        '1542362567-b07e54358753',    // sports car
        '1494905998402-395d579af36f', // SUV
        '1568844293986-8d0400bd4745', // hatchback
        '1559416523-d9b3b1f3f6e2',    // MPV
        '1485291571150-772bcfc10da5', // interior front
        '1503736334956-4c8f8e92946d', // classic
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
        foreach (self::INVENTORY as $index => $car) {
            $photoId = self::PHOTOS[$index % count(self::PHOTOS)];
            Car::create([
                'brand'     => $car['brand'],
                'model'     => $car['model'],
                'type'      => $car['type'],
                'image_url' => "https://images.unsplash.com/photo-{$photoId}?w=800&q=80&auto=format&fit=crop",
            ]);
        }
    }
}
