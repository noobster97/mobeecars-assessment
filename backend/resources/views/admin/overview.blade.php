@extends('layouts.admin', ['title' => 'Overview'])

@section('content')
<div class="mb-6">
    <h1 class="text-3xl font-black tracking-tight">Overview</h1>
    <p class="text-sm text-slate-500 mt-1">System-wide stats across all Mobee Cars users</p>
</div>

@if(session('status'))
    <div class="mb-5 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
        {{ session('status') }}
    </div>
@endif

<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
    <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
        <div class="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">Users</div>
        <div class="text-2xl md:text-3xl font-black text-slate-900 mt-1 tabular-nums">{{ $totals['users'] }}</div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
        <div class="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">Cars</div>
        <div class="text-2xl md:text-3xl font-black text-slate-900 mt-1 tabular-nums">{{ $totals['cars'] }}</div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
        <div class="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">Swipes</div>
        <div class="text-2xl md:text-3xl font-black text-slate-900 mt-1 tabular-nums">{{ $totals['swipes'] }}</div>
    </div>
    <div class="bg-primary-50 rounded-xl border border-primary-100 p-4 md:p-5">
        <div class="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-primary-700">Like rate</div>
        <div class="text-2xl md:text-3xl font-black text-primary-700 mt-1 tabular-nums">{{ $totals['likeRate'] }}%</div>
    </div>
</div>

@if($totals['swipes'] === 0)
    <div class="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <div class="text-slate-400 text-sm">No swipes recorded yet. Once users start swiping, brand & type rankings will appear here.</div>
    </div>
@else
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold uppercase tracking-widest text-slate-600">Brand popularity</h3>
                <span class="text-xs text-slate-400">liked swipes</span>
            </div>
            @php $maxBrand = $brandRanking->max('count') ?: 1; @endphp
            <div class="space-y-3">
                @foreach($brandRanking as $row)
                    <div>
                        <div class="flex justify-between text-sm mb-1.5">
                            <span class="font-semibold text-slate-900">{{ $row->label }}</span>
                            <span class="font-bold text-slate-600 tabular-nums">{{ $row->count }}</span>
                        </div>
                        <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-primary-500 rounded-full" style="width: {{ ($row->count / $maxBrand) * 100 }}%"></div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold uppercase tracking-widest text-slate-600">Type popularity</h3>
                <span class="text-xs text-slate-400">liked swipes</span>
            </div>
            @php $maxType = $typeRanking->max('count') ?: 1; @endphp
            <div class="space-y-3">
                @foreach($typeRanking as $row)
                    <div>
                        <div class="flex justify-between text-sm mb-1.5">
                            <span class="font-semibold text-slate-900">{{ $row->label }}</span>
                            <span class="font-bold text-slate-600 tabular-nums">{{ $row->count }}</span>
                        </div>
                        <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-slate-700 rounded-full" style="width: {{ ($row->count / $maxType) * 100 }}%"></div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    @if($topCars->isNotEmpty())
        <div class="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 mb-4">
            <h3 class="text-sm font-bold uppercase tracking-widest text-slate-600 mb-4">Top 5 most liked cars</h3>
            <div class="space-y-3">
                @foreach($topCars as $i => $car)
                    <div class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition">
                        <div class="w-7 h-7 flex items-center justify-center rounded-full bg-primary-50 text-primary-700 font-black text-sm">{{ $i + 1 }}</div>
                        <img src="{{ $car->image_url }}" alt="" class="w-12 h-12 rounded-lg object-cover bg-slate-100" loading="lazy">
                        <div class="flex-1 min-w-0">
                            <div class="font-semibold text-slate-900 truncate">{{ $car->brand }} {{ $car->model }}</div>
                            <div class="text-xs text-slate-500 uppercase tracking-widest">{{ $car->type }}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-black tabular-nums text-emerald-600">{{ $car->likes }}</div>
                            <div class="text-[10px] text-slate-400 uppercase tracking-widest">likes</div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <div class="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
        <h3 class="text-sm font-bold uppercase tracking-widest text-slate-600 mb-4">Recent activity</h3>
        <div class="space-y-2">
            @foreach($recentActivity as $row)
                <div class="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                    <img src="{{ $row->car->image_url }}" alt="" class="w-10 h-10 rounded-lg object-cover bg-slate-100" loading="lazy">
                    <div class="flex-1 min-w-0">
                        <div class="text-sm">
                            <span class="font-semibold text-slate-900">{{ $row->user->name }}</span>
                            <span class="text-slate-500">{{ $row->liked ? 'liked' : 'skipped' }}</span>
                            <span class="font-semibold text-slate-900">{{ $row->car->brand }} {{ $row->car->model }}</span>
                        </div>
                        <div class="text-[11px] text-slate-400">
                            <time data-rel datetime="{{ $row->swiped_at?->toIso8601String() }}">{{ $row->swiped_at?->diffForHumans() }}</time>
                        </div>
                    </div>
                    @if($row->liked)
                        <span class="text-emerald-600">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>
                        </span>
                    @else
                        <span class="text-red-500">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                        </span>
                    @endif
                </div>
            @endforeach
        </div>
    </div>
@endif
@endsection
