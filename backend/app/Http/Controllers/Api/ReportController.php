<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Most liked brand / model / type for the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $topBrand = $this->topAggregate($userId, ['cars.brand']);
        $topModel = $this->topAggregate($userId, ['cars.brand', 'cars.model']);
        $topType  = $this->topAggregate($userId, ['cars.type']);

        $totalLikes    = DB::table('user_car_likes')->where('user_id', $userId)->where('liked', true)->count();
        $totalDislikes = DB::table('user_car_likes')->where('user_id', $userId)->where('liked', false)->count();

        return response()->json([
            'most_liked_brand' => $topBrand ? [
                'brand' => $topBrand->brand,
                'count' => (int) $topBrand->count,
            ] : null,
            'most_liked_model' => $topModel ? [
                'brand' => $topModel->brand,
                'model' => $topModel->model,
                'count' => (int) $topModel->count,
            ] : null,
            'most_liked_type'  => $topType ? [
                'type'  => $topType->type,
                'count' => (int) $topType->count,
            ] : null,
            'total_likes'      => $totalLikes,
            'total_dislikes'   => $totalDislikes,
        ]);
    }

    private function topAggregate(int $userId, array $groupBy)
    {
        return DB::table('user_car_likes')
            ->join('cars', 'user_car_likes.car_id', '=', 'cars.id')
            ->where('user_car_likes.user_id', $userId)
            ->where('user_car_likes.liked', true)
            ->select(array_merge($groupBy, [DB::raw('COUNT(*) as count')]))
            ->groupBy($groupBy)
            ->orderByDesc('count')
            ->first();
    }
}
