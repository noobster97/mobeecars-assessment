@extends('layouts.admin', ['title' => $user->name])

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.users.index') }}" class="text-sm text-slate-500 hover:text-primary-600">&larr; All users</a>
</div>

<div class="flex flex-wrap items-start justify-between gap-4 mb-8">
    <div>
        <h1 class="text-3xl font-black tracking-tight">{{ $user->name }}</h1>
        <p class="text-sm text-slate-500 mt-1">{{ $user->email }} · joined {{ $user->created_at?->format('M j, Y') }}</p>
    </div>
    @if($user->is_admin)
        <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white">Admin</span>
    @endif
</div>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total swipes</div>
        <div class="text-3xl font-black text-slate-900 mt-1 tabular-nums">{{ $stats['total'] }}</div>
    </div>
    <div class="bg-emerald-500 rounded-xl p-5 text-white">
        <div class="text-[11px] font-bold uppercase tracking-widest text-white/80">Liked</div>
        <div class="text-3xl font-black mt-1 tabular-nums">{{ $stats['likes'] }}</div>
    </div>
    <div class="bg-red-500 rounded-xl p-5 text-white">
        <div class="text-[11px] font-bold uppercase tracking-widest text-white/80">Skipped</div>
        <div class="text-3xl font-black mt-1 tabular-nums">{{ $stats['dislikes'] }}</div>
    </div>
    <div class="bg-primary-50 rounded-xl border border-primary-100 p-5">
        <div class="text-[11px] font-bold uppercase tracking-widest text-primary-700">Match rate</div>
        <div class="text-3xl font-black text-primary-700 mt-1 tabular-nums">{{ $stats['likeRate'] }}%</div>
    </div>
</div>

@if ($stats['total'] === 0)
    <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div class="text-slate-400 text-sm">This user hasn't swiped any cars yet.</div>
    </div>
@else
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-slate-200 p-5">
            <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Top brand</div>
            <div class="text-xl font-bold text-slate-900">{{ $stats['topBrand']?->key ?? '—' }}</div>
            @if($stats['topBrand'])
                <div class="text-xs text-slate-500 mt-0.5">{{ $stats['topBrand']->count }} likes</div>
            @endif
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-5">
            <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Top model</div>
            <div class="text-xl font-bold text-slate-900">
                {{ $stats['topModel'] ? $stats['topModel']->brand . ' ' . $stats['topModel']->model : '—' }}
            </div>
            @if($stats['topModel'])
                <div class="text-xs text-slate-500 mt-0.5">{{ $stats['topModel']->count }} likes</div>
            @endif
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-5">
            <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Top type</div>
            <div class="text-xl font-bold text-slate-900">{{ $stats['topType']?->key ?? '—' }}</div>
            @if($stats['topType'])
                <div class="text-xs text-slate-500 mt-0.5">{{ $stats['topType']->count }} likes</div>
            @endif
        </div>
    </div>

    @if($stats['brandDist']->count() > 0)
        <div class="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
            <h3 class="text-sm font-bold uppercase tracking-widest text-slate-600 mb-4">Brand distribution (liked)</h3>
            @php $maxBrand = $stats['brandDist']->max('count') ?: 1; @endphp
            <div class="space-y-3">
                @foreach($stats['brandDist'] as $row)
                    <div>
                        <div class="flex justify-between text-sm mb-1.5">
                            <span class="font-semibold text-slate-900">{{ $row->key }}</span>
                            <span class="font-bold text-slate-600 tabular-nums">{{ $row->count }}</span>
                        </div>
                        <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-primary-500 rounded-full" style="width: {{ ($row->count / $maxBrand) * 100 }}%"></div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    @if($stats['typeDist']->count() > 0)
        <div class="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <h3 class="text-sm font-bold uppercase tracking-widest text-slate-600 mb-4">Type distribution (liked)</h3>
            @php $maxType = $stats['typeDist']->max('count') ?: 1; @endphp
            <div class="space-y-3">
                @foreach($stats['typeDist'] as $row)
                    <div>
                        <div class="flex justify-between text-sm mb-1.5">
                            <span class="font-semibold text-slate-900">{{ $row->key }}</span>
                            <span class="font-bold text-slate-600 tabular-nums">{{ $row->count }}</span>
                        </div>
                        <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-slate-700 rounded-full" style="width: {{ ($row->count / $maxType) * 100 }}%"></div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200">
            <h3 class="text-sm font-bold uppercase tracking-widest text-slate-600">Swipe activity</h3>
        </div>
        <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th class="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Car</th>
                    <th class="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Type</th>
                    <th class="text-center px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Action</th>
                    <th class="text-right px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Swiped at</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @foreach($activity as $row)
                    <tr class="hover:bg-slate-50 transition">
                        <td class="px-6 py-3 flex items-center gap-3">
                            <img src="{{ $row->car->image_url }}" alt="" class="w-12 h-12 rounded-lg object-cover bg-slate-100" loading="lazy">
                            <div>
                                <div class="font-semibold text-slate-900">{{ $row->car->brand }} {{ $row->car->model }}</div>
                            </div>
                        </td>
                        <td class="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">{{ $row->car->type }}</td>
                        <td class="px-6 py-3 text-center">
                            @if($row->liked)
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700">
                                    Liked
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-red-50 text-red-700">
                                    Skipped
                                </span>
                            @endif
                        </td>
                        <td class="px-6 py-3 text-right text-xs text-slate-500 tabular-nums">{{ $row->swiped_at?->format('M j, Y · H:i') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        @if ($activity->hasPages())
            <div class="px-6 py-4 border-t border-slate-200">
                {{ $activity->links() }}
            </div>
        @endif
    </div>
@endif
@endsection
