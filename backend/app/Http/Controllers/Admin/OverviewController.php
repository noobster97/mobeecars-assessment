<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\User;
use App\Models\UserCarLike;
use Illuminate\Support\Carbon;
use Illuminate\View\View;

class OverviewController extends Controller
{
    public function __invoke(): View
    {
        $totals = [
            'users'    => User::where('is_admin', false)->count(),
            'cars'     => Car::count(),
            'swipes'   => UserCarLike::count(),
            'likes'    => UserCarLike::where('liked', true)->count(),
        ];
        $totals['likeRate'] = $totals['swipes'] > 0
            ? round(($totals['likes'] / $totals['swipes']) * 100)
            : 0;

        $brandRanking = UserCarLike::query()
            ->join('cars', 'cars.id', '=', 'user_car_likes.car_id')
            ->where('user_car_likes.liked', true)
            ->groupBy('cars.brand')
            ->selectRaw('cars.brand as label, COUNT(*) as count')
            ->orderByDesc('count')
            ->limit(8)
            ->get();

        $typeRanking = UserCarLike::query()
            ->join('cars', 'cars.id', '=', 'user_car_likes.car_id')
            ->where('user_car_likes.liked', true)
            ->groupBy('cars.type')
            ->selectRaw('cars.type as label, COUNT(*) as count')
            ->orderByDesc('count')
            ->get();

        $topCars = UserCarLike::query()
            ->join('cars', 'cars.id', '=', 'user_car_likes.car_id')
            ->where('user_car_likes.liked', true)
            ->groupBy('cars.id', 'cars.brand', 'cars.model', 'cars.type', 'cars.image_url')
            ->selectRaw('cars.id, cars.brand, cars.model, cars.type, cars.image_url, COUNT(*) as likes')
            ->orderByDesc('likes')
            ->limit(5)
            ->get();

        $recentActivity = UserCarLike::query()
            ->with(['user:id,name,email', 'car:id,brand,model,type,image_url'])
            ->orderByDesc('swiped_at')
            ->limit(10)
            ->get();

        return view('admin.overview', compact(
            'totals',
            'brandRanking',
            'typeRanking',
            'topCars',
            'recentActivity',
        ));
    }
}
