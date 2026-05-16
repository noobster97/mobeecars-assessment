@extends('layouts.admin', ['title' => 'Add car'])

@section('content')
<div class="mb-6">
    <a href="{{ route('admin.cars.index') }}" class="text-sm text-slate-500 hover:text-primary-600">&larr; All cars</a>
</div>

<h1 class="text-3xl font-black tracking-tight mb-6">Add new car</h1>

<form method="POST" action="{{ route('admin.cars.store') }}" enctype="multipart/form-data" class="max-w-xl">
    @csrf
    @include('admin.cars._form')
    <div class="flex items-center gap-3 mt-6">
        <button type="submit" class="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg transition">
            Add car
        </button>
        <a href="{{ route('admin.cars.index') }}" class="text-sm font-semibold text-slate-500 hover:text-slate-700">
            Cancel
        </a>
    </div>
</form>
@endsection
