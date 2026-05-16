<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\UserCarLike;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CarController extends Controller
{
    private const TYPES = ['SUV', 'Sedan', 'Hatchback', 'MPV', 'Pickup', 'Coupe'];

    public function index(Request $request): View
    {
        $search = trim((string) $request->get('q', ''));
        $type   = $request->get('type');

        $cars = Car::query()
            ->withCount([
                'likes as likes_count' => fn ($q) => $q->where('liked', true),
                'likes as skips_count' => fn ($q) => $q->where('liked', false),
            ])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('brand', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%");
                });
            })
            ->when($type, fn ($q) => $q->where('type', $type))
            ->orderBy('brand')
            ->orderBy('model')
            ->paginate(20)
            ->withQueryString();

        return view('admin.cars.index', [
            'cars'   => $cars,
            'types'  => self::TYPES,
            'search' => $search,
            'typeFilter' => $type,
        ]);
    }

    public function create(): View
    {
        return view('admin.cars.create', ['types' => self::TYPES]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        Car::create($data);
        return redirect()->route('admin.cars.index')->with('status', "Added {$data['brand']} {$data['model']}.");
    }

    public function edit(Car $car): View
    {
        return view('admin.cars.edit', ['car' => $car, 'types' => self::TYPES]);
    }

    public function update(Request $request, Car $car): RedirectResponse
    {
        $data = $this->validateData($request);
        $car->update($data);
        return redirect()->route('admin.cars.index')->with('status', "Updated {$data['brand']} {$data['model']}.");
    }

    public function destroy(Car $car): RedirectResponse
    {
        $label = "{$car->brand} {$car->model}";
        $car->delete();
        return redirect()->route('admin.cars.index')->with('status', "Deleted {$label}.");
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'brand'     => ['required', 'string', 'max:80'],
            'model'     => ['required', 'string', 'max:120'],
            'type'      => ['required', 'in:' . implode(',', self::TYPES)],
            'image_url' => ['required', 'url', 'max:1000'],
        ]);
    }
}
