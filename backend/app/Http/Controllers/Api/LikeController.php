<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncLikesRequest;
use App\Models\UserCarLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class LikeController extends Controller
{
    /**
     * Bulk-sync local swipes from mobile. Last-write-wins on unique (user_id, car_id).
     */
    public function sync(SyncLikesRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $synced = 0;

        DB::transaction(function () use ($request, $userId, &$synced) {
            foreach ($request->validated('likes') as $like) {
                UserCarLike::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'car_id'  => $like['car_id'],
                    ],
                    [
                        'liked'      => $like['liked'],
                        'swiped_at'  => $like['swiped_at'],
                    ]
                );
                $synced++;
            }
        });

        return response()->json([
            'synced'  => $synced,
            'message' => "Synced {$synced} swipes.",
        ]);
    }

    /**
     * Optional: return current user's like history.
     */
    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $likes = $request->user()
            ->likes()
            ->with('car:id,brand,model,type,image_url')
            ->orderByDesc('swiped_at')
            ->get(['id', 'car_id', 'liked', 'swiped_at']);

        return response()->json(['likes' => $likes]);
    }
}
