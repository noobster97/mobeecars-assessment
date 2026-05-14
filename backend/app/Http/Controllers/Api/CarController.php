<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\JsonResponse;

class CarController extends Controller
{
    /**
     * Full inventory snapshot for offline-first mobile sync.
     */
    public function index(): JsonResponse
    {
        $cars = Car::query()
            ->orderBy('id')
            ->get(['id', 'brand', 'model', 'type', 'image_url', 'updated_at']);

        return response()->json([
            'cars'        => $cars,
            'total'       => $cars->count(),
            'fetched_at'  => now()->toIso8601String(),
        ]);
    }
}
