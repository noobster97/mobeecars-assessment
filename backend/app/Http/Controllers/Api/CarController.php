<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarController extends Controller
{
    /**
     * Full inventory snapshot for offline-first mobile sync. Resolves any
     * locally-stored image paths (e.g. /storage/cars/abc.jpg uploaded via
     * the admin dashboard) to absolute URLs using the current request host,
     * so the mobile client always gets fetch-able URLs regardless of where
     * the admin happens to upload from.
     */
    public function index(Request $request): JsonResponse
    {
        $cars = Car::query()
            ->orderBy('id')
            ->get(['id', 'brand', 'model', 'type', 'image_url', 'updated_at']);

        $host = $request->getSchemeAndHttpHost();
        $cars->transform(function ($car) use ($host) {
            $url = (string) $car->image_url;
            if (!preg_match('#^https?://#i', $url)) {
                $car->image_url = $host . '/' . ltrim($url, '/');
            }
            return $car;
        });

        return response()->json([
            'cars'        => $cars,
            'total'       => $cars->count(),
            'fetched_at'  => now()->toIso8601String(),
        ]);
    }
}
