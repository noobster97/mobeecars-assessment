@extends('layouts.admin', ['title' => 'Edit car'])

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.cars.index') }}" class="text-sm text-slate-500 hover:text-primary-600">&larr; All cars</a>
</div>

<h1 class="text-3xl font-black tracking-tight mb-1">Edit car</h1>
<p class="text-sm text-slate-500 mb-6">{{ $car->brand }} {{ $car->model }}</p>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
    <form method="POST" action="{{ route('admin.cars.update', $car) }}" class="md:col-span-2">
        @csrf @method('PATCH')
        @include('admin.cars._form')
        <div class="flex items-center gap-3 mt-6">
            <button type="submit" class="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg transition">
                Save changes
            </button>
            <a href="{{ route('admin.cars.index') }}" class="text-sm font-semibold text-slate-500 hover:text-slate-700">
                Cancel
            </a>
        </div>
    </form>

    <div>
        <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Current image</div>
        <div class="aspect-[16/10] rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
            <img src="{{ $car->image_url }}" alt="" class="w-full h-full object-cover">
        </div>
    </div>
</div>
@endsection
