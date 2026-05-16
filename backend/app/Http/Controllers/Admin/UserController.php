<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserCarLike;
use Illuminate\View\View;

class UserController extends Controller
{
    public function index(): View
    {
        $users = User::query()
            ->withCount([
                'likes',
                'likes as liked_count' => fn ($q) => $q->where('liked', true),
                'likes as disliked_count' => fn ($q) => $q->where('liked', false),
            ])
            ->orderByDesc('id')
            ->paginate(20);

        $totals = [
            'users'  => User::count(),
            'admins' => User::where('is_admin', true)->count(),
            'swipes' => UserCarLike::count(),
            'likes'  => UserCarLike::where('liked', true)->count(),
        ];

        return view('admin.users.index', compact('users', 'totals'));
    }

    public function show(User $user): View
    {
        $activity = UserCarLike::query()
            ->where('user_id', $user->id)
            ->with('car')
            ->orderByDesc('swiped_at')
            ->paginate(30);

        $likes = UserCarLike::where('user_id', $user->id)->where('liked', true)->count();
        $dislikes = UserCarLike::where('user_id', $user->id)->where('liked', false)->count();
        $total = $likes + $dislikes;

        $brandRow = UserCarLike::query()
            ->join('cars', 'cars.id', '=', 'user_car_likes.car_id')
            ->where('user_car_likes.user_id', $user->id)
            ->where('user_car_likes.liked', true)
            ->groupBy('cars.brand')
            ->selectRaw('cars.brand as key, COUNT(*) as count')
            ->orderByDesc('count')
            ->first();

        $modelRow = UserCarLike::query()
            ->join('cars', 'cars.id', '=', 'user_car_likes.car_id')
            ->where('user_car_likes.user_id', $user->id)
            ->where('user_car_likes.liked', true)
            ->groupBy('cars.brand', 'cars.model')
            ->selectRaw('cars.brand, cars.model, COUNT(*) as count')
            ->orderByDesc('count')
            ->first();

        $typeRow = UserCarLike::query()
            ->join('cars', 'cars.id', '=', 'user_car_likes.car_id')
            ->where('user_car_likes.user_id', $user->id)
            ->where('user_car_likes.liked', true)
            ->groupBy('cars.type')
            ->selectRaw('cars.type as key, COUNT(*) as count')
            ->orderByDesc('count')
            ->first();

        $brandDistribution = UserCarLike::query()
            ->join('cars', 'cars.id', '=', 'user_car_likes.car_id')
            ->where('user_car_likes.user_id', $user->id)
            ->where('user_car_likes.liked', true)
            ->groupBy('cars.brand')
            ->selectRaw('cars.brand as key, COUNT(*) as count')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        $typeDistribution = UserCarLike::query()
            ->join('cars', 'cars.id', '=', 'user_car_likes.car_id')
            ->where('user_car_likes.user_id', $user->id)
            ->where('user_car_likes.liked', true)
            ->groupBy('cars.type')
            ->selectRaw('cars.type as key, COUNT(*) as count')
            ->orderByDesc('count')
            ->get();

        $stats = [
            'likes'     => $likes,
            'dislikes'  => $dislikes,
            'total'     => $total,
            'likeRate'  => $total > 0 ? round(($likes / $total) * 100) : 0,
            'topBrand'  => $brandRow,
            'topModel'  => $modelRow,
            'topType'   => $typeRow,
            'brandDist' => $brandDistribution,
            'typeDist'  => $typeDistribution,
        ];

        return view('admin.users.show', compact('user', 'activity', 'stats'));
    }
}
