<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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
        $data = $this->validateData($request, $car);

        // If user replaced the image via upload, delete the previous file
        // (only if it was a local upload — never delete remote URLs).
        if ($request->hasFile('image_file') && $this->isLocalUpload($car->image_url)) {
            $oldPath = ltrim(parse_url($car->image_url, PHP_URL_PATH) ?: $car->image_url, '/');
            $oldPath = preg_replace('#^storage/#', '', $oldPath);
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $car->update($data);
        return redirect()->route('admin.cars.index')->with('status', "Updated {$data['brand']} {$data['model']}.");
    }

    public function destroy(Car $car): RedirectResponse
    {
        $label = "{$car->brand} {$car->model}";

        if ($this->isLocalUpload($car->image_url)) {
            $oldPath = preg_replace('#^/?storage/#', '', parse_url($car->image_url, PHP_URL_PATH) ?: $car->image_url);
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $car->delete();
        return redirect()->route('admin.cars.index')->with('status', "Deleted {$label}.");
    }

    /**
     * Validates car fields. Accepts EITHER a file upload OR an image URL —
     * file wins when both are present. At least one must be provided on
     * create; on edit, both can be empty (keep existing image).
     */
    private function validateData(Request $request, ?Car $existing = null): array
    {
        $hasFile = $request->hasFile('image_file');
        $hasUrl  = filled($request->input('image_url'));
        $isCreate = $existing === null;

        if ($isCreate && !$hasFile && !$hasUrl) {
            abort(redirect()->back()->withInput()->withErrors([
                'image_file' => 'Upload an image or provide an image URL.',
            ]));
        }

        $rules = [
            'brand'      => ['required', 'string', 'max:80'],
            'model'      => ['required', 'string', 'max:120'],
            'type'       => ['required', Rule::in(self::TYPES)],
            'image_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'image_url'  => ['nullable', 'string', 'max:1000'],
        ];

        if ($hasUrl && !$hasFile) {
            $rules['image_url'][] = 'url';
        }

        $validated = $request->validate($rules);

        $data = [
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'type'  => $validated['type'],
        ];

        if ($hasFile) {
            $path = $request->file('image_file')->store('cars', 'public');
            $data['image_url'] = '/storage/' . $path;
        } elseif ($hasUrl) {
            $data['image_url'] = $validated['image_url'];
        }
        // else: editing without changes — leave image_url alone

        return $data;
    }

    private function isLocalUpload(?string $url): bool
    {
        if (!$url) return false;
        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        return str_contains($path, '/storage/cars/');
    }
}
