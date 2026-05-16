<?php

namespace Database\Seeders;

use App\Models\Car;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    /**
     * Per-model photos sourced from Wikipedia Commons (originalimage.source via
     * REST summary API). Each car shows the actual model — not a type-cycled
     * stock photo. URLs are hot-linked direct from upload.wikimedia.org.
     */
    private const INVENTORY = [
        // Toyota
        ['brand' => 'Toyota', 'model' => 'Vios 1.5G',           'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Toyota_Vios_1.5_VVT-i_G_%28IV%29_%E2%80%93_f_13032025.jpg/3840px-Toyota_Vios_1.5_VVT-i_G_%28IV%29_%E2%80%93_f_13032025.jpg'],
        ['brand' => 'Toyota', 'model' => 'Camry 2.5V',          'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/3840px-2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg'],
        ['brand' => 'Toyota', 'model' => 'Hilux Rogue 2.8',     'type' => 'Pickup',    'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2016_Toyota_HiLux_Invincible_D-4D_4WD_2.4_Front.jpg/3840px-2016_Toyota_HiLux_Invincible_D-4D_4WD_2.4_Front.jpg'],
        ['brand' => 'Toyota', 'model' => 'Alphard Executive',   'type' => 'MPV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/2018-2023_Toyota_Alphard_X.jpg/3840px-2018-2023_Toyota_Alphard_X.jpg'],
        ['brand' => 'Toyota', 'model' => 'Corolla Cross 1.8',   'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/4/43/2023_Toyota_Corolla_Cross_XLE_4WD_in_Wind_Chill_Pearl%2C_front_left.jpg'],

        // Honda
        ['brand' => 'Honda', 'model' => 'City RS e:HEV',        'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/a/a9/2022_Honda_City_ZX_i-VTEC_%28India%29_front_view_%28cropped%29.jpg'],
        ['brand' => 'Honda', 'model' => 'Civic RS Turbo',       'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_30062024.jpg/3840px-Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_30062024.jpg'],
        ['brand' => 'Honda', 'model' => 'CR-V 1.5 TC-P',        'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Honda_CR-V_e-HEV_Elegance_AWD_%28VI%29_%E2%80%93_f_14072024.jpg/3840px-Honda_CR-V_e-HEV_Elegance_AWD_%28VI%29_%E2%80%93_f_14072024.jpg'],
        ['brand' => 'Honda', 'model' => 'Jazz V',               'type' => 'Hatchback', 'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Honda_Jazz_Hybrid_Executive_%28IV%29_%E2%80%93_f_18102020.jpg/3840px-Honda_Jazz_Hybrid_Executive_%28IV%29_%E2%80%93_f_18102020.jpg'],

        // Perodua
        ['brand' => 'Perodua', 'model' => 'Myvi 1.5 AV',        'type' => 'Hatchback', 'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Perodua_Myvi_1.5_VVT-i_AV_%28III%2C_Facelift%29_%E2%80%93_f_13032025.jpg/3840px-Perodua_Myvi_1.5_VVT-i_AV_%28III%2C_Facelift%29_%E2%80%93_f_13032025.jpg'],
        ['brand' => 'Perodua', 'model' => 'Bezza 1.3 AV',       'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/5/51/Perodua_Bezza_Advance.jpg'],
        ['brand' => 'Perodua', 'model' => 'Axia 1.0 SE',        'type' => 'Hatchback', 'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2024_Perodua_Axia_1.0_X_front.jpg/3840px-2024_Perodua_Axia_1.0_X_front.jpg'],
        ['brand' => 'Perodua', 'model' => 'Aruz 1.5 AV',        'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/2018_Daihatsu_Terios_1.5_R_Deluxe_wagon_%28F800RG%3B_01-12-2019%29%2C_South_Tangerang.jpg/3840px-2018_Daihatsu_Terios_1.5_R_Deluxe_wagon_%28F800RG%3B_01-12-2019%29%2C_South_Tangerang.jpg'],

        // Proton
        ['brand' => 'Proton', 'model' => 'X50 Flagship',        'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/f/ff/2025_Proton_X50_facelift.jpg'],
        ['brand' => 'Proton', 'model' => 'X70 Premium',         'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/2024_Proton_X70_Executive_front_%281%29.jpg/3840px-2024_Proton_X70_Executive_front_%281%29.jpg'],
        ['brand' => 'Proton', 'model' => 'Saga Premium S',      'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Three_generations_of_Proton_Saga_%2830383928616%29.jpg/3840px-Three_generations_of_Proton_Saga_%2830383928616%29.jpg'],

        // BMW
        ['brand' => 'BMW', 'model' => '320i M Sport',           'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/BMW_G20_%282022%29_IMG_7316_%282%29.jpg/3840px-BMW_G20_%282022%29_IMG_7316_%282%29.jpg'],
        ['brand' => 'BMW', 'model' => 'X3 xDrive30i',           'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/BMW_G45_20_IMG_3794.jpg/3840px-BMW_G45_20_IMG_3794.jpg'],
        ['brand' => 'BMW', 'model' => '218i Gran Coupe',        'type' => 'Coupe',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/BMW_F44_1X7A6109.jpg/3840px-BMW_F44_1X7A6109.jpg'],

        // Mercedes-Benz
        ['brand' => 'Mercedes-Benz', 'model' => 'C200 AMG Line',  'type' => 'Sedan',   'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Mercedes-Benz_W206_IMG_6380.jpg/3840px-Mercedes-Benz_W206_IMG_6380.jpg'],
        ['brand' => 'Mercedes-Benz', 'model' => 'GLC 300 4MATIC', 'type' => 'SUV',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Mercedes-Benz_X254_1X7A6343.jpg/3840px-Mercedes-Benz_X254_1X7A6343.jpg'],

        // Mazda
        ['brand' => 'Mazda', 'model' => 'CX-5 2.0 GLS',         'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/2024_Mazda_CX-5_2.5_S_Select_in_Platinum_Quartz_Metallic%2C_front_right.jpg/3840px-2024_Mazda_CX-5_2.5_S_Select_in_Platinum_Quartz_Metallic%2C_front_right.jpg'],
        ['brand' => 'Mazda', 'model' => 'CX-30 2.0 Mid',        'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Mazda_CX-30_Touring%2C_2020_front.jpg/3840px-Mazda_CX-30_Touring%2C_2020_front.jpg'],

        // Hyundai
        ['brand' => 'Hyundai', 'model' => 'Tucson 2.0 Elegance', 'type' => 'SUV',      'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/c/c6/2022_Hyundai_Tucson_Preferred%2C_Front_Right%2C_05-24-2021.jpg'],
        ['brand' => 'Hyundai', 'model' => 'Elantra 1.6',        'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/a/a4/2023_Hyundai_Elantra_Limited_in_Silver%2C_front_left%2C_04-04-2026.jpg'],

        // Nissan
        ['brand' => 'Nissan', 'model' => 'Almera VLT Turbo',    'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/2023_Nissan_Versa_%28N18%29_IMG_3105.jpg/3840px-2023_Nissan_Versa_%28N18%29_IMG_3105.jpg'],
        ['brand' => 'Nissan', 'model' => 'X-Trail 2.5 4WD',     'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Nissan_X-Trail_%28T33%29_1X7A7179.jpg/3840px-Nissan_X-Trail_%28T33%29_1X7A7179.jpg'],

        // Audi
        ['brand' => 'Audi', 'model' => 'A4 2.0 TFSI',           'type' => 'Sedan',     'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Audi_A4_B9_sedans_%28FL%29_1X7A2441.jpg/3840px-Audi_A4_B9_sedans_%28FL%29_1X7A2441.jpg'],

        // Ford
        ['brand' => 'Ford', 'model' => 'Ranger Wildtrak 2.0',   'type' => 'Pickup',    'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Ford_Ranger_%28T6%2C_P703%29_Wildtrak_IMG_7320.jpg/3840px-Ford_Ranger_%28T6%2C_P703%29_Wildtrak_IMG_7320.jpg'],

        // Volkswagen
        ['brand' => 'Volkswagen', 'model' => 'Tiguan Allspace', 'type' => 'SUV',       'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Volkswagen_Tiguan_III_IMG_8823_%28cropped%29.jpg/3840px-Volkswagen_Tiguan_III_IMG_8823_%28cropped%29.jpg'],
    ];

    public function run(): void
    {
        foreach (self::INVENTORY as $car) {
            Car::create([
                'brand'     => $car['brand'],
                'model'     => $car['model'],
                'type'      => $car['type'],
                'image_url' => $car['image_url'],
            ]);
        }
    }
}
