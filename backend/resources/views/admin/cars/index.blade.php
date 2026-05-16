@extends('layouts.admin', ['title' => 'Cars'])

@section('content')
<div class="flex flex-wrap items-start justify-between gap-3 mb-6">
    <div>
        <h1 class="text-3xl font-black tracking-tight">Cars</h1>
        <p class="text-sm text-slate-500 mt-1">Manage the car inventory ({{ $cars->total() }} total)</p>
    </div>
    <a href="{{ route('admin.cars.create') }}"
       class="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        Add car
    </a>
</div>

@if(session('status'))
    <div class="mb-5 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
        {{ session('status') }}
    </div>
@endif

<form method="GET" class="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col sm:flex-row gap-3">
    <div class="flex-1">
        <input type="text" name="q" value="{{ $search }}" placeholder="Search by brand or model…"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition">
    </div>
    <div>
        <select name="type"
            class="w-full sm:w-40 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition">
            <option value="">All types</option>
            @foreach($types as $t)
                <option value="{{ $t }}" {{ $typeFilter === $t ? 'selected' : '' }}>{{ $t }}</option>
            @endforeach
        </select>
    </div>
    <button type="submit"
        class="bg-slate-900 hover:bg-slate-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition">
        Filter
    </button>
    @if($search !== '' || $typeFilter)
        <a href="{{ route('admin.cars.index') }}"
            class="text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-2.5 transition self-center">
            Clear
        </a>
    @endif
</form>

@if($cars->isEmpty())
    <div class="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-400">
        No cars match your filters.
    </div>
@else
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @foreach($cars as $car)
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                <div class="relative aspect-[16/10] bg-slate-100">
                    <img src="{{ $car->image_url }}" alt="" class="absolute inset-0 w-full h-full object-cover" loading="lazy">
                    <div class="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                        {{ $car->type }}
                    </div>
                </div>
                <div class="p-4 flex-1 flex flex-col">
                    <div class="font-bold text-slate-900 text-base leading-tight">{{ $car->brand }}</div>
                    <div class="text-sm text-slate-600 mt-0.5">{{ $car->model }}</div>
                    <div class="flex items-center gap-3 mt-3 text-xs">
                        <span class="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>
                            {{ $car->likes_count }}
                        </span>
                        <span class="inline-flex items-center gap-1 text-red-500 font-semibold">
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                            {{ $car->skips_count }}
                        </span>
                    </div>
                    <div class="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <a href="{{ route('admin.cars.edit', $car) }}"
                           class="flex-1 text-center text-sm font-semibold text-primary-600 hover:bg-primary-50 py-2 rounded-lg transition">
                            Edit
                        </a>
                        <form method="POST" action="{{ route('admin.cars.destroy', $car) }}"
                              onsubmit="return confirm('Delete {{ $car->brand }} {{ $car->model }}? This cannot be undone.')" class="flex-1">
                            @csrf @method('DELETE')
                            <button type="submit" class="w-full text-sm font-semibold text-red-600 hover:bg-red-50 py-2 rounded-lg transition">
                                Delete
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    @if ($cars->hasPages())
        <div class="mt-6">
            {{ $cars->links() }}
        </div>
    @endif
@endif
@endsection
