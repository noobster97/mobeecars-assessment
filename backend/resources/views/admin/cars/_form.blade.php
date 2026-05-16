@php
    $car = $car ?? null;
@endphp

@if ($errors->any())
    <div class="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
        <ul class="list-disc pl-4 space-y-0.5">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<div class="space-y-4">
    <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Brand</label>
        <input type="text" name="brand" value="{{ old('brand', $car?->brand) }}" required
            class="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            placeholder="e.g. Toyota">
    </div>
    <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Model</label>
        <input type="text" name="model" value="{{ old('model', $car?->model) }}" required
            class="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            placeholder="e.g. Vios 1.5G">
    </div>
    <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Type</label>
        <select name="type" required
            class="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition">
            @foreach($types as $t)
                <option value="{{ $t }}" {{ old('type', $car?->type) === $t ? 'selected' : '' }}>{{ $t }}</option>
            @endforeach
        </select>
    </div>

    <div x-data="{ tab: '{{ old('image_source', 'upload') }}' }" class="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div class="flex items-center gap-2 mb-3">
            <button type="button" @click="tab = 'upload'"
                :class="tab === 'upload' ? 'bg-white text-primary-700 shadow-sm border-primary-200' : 'text-slate-500 hover:text-slate-700 border-transparent'"
                class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition">
                Upload file
            </button>
            <button type="button" @click="tab = 'url'"
                :class="tab === 'url' ? 'bg-white text-primary-700 shadow-sm border-primary-200' : 'text-slate-500 hover:text-slate-700 border-transparent'"
                class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition">
                Use URL
            </button>
        </div>

        <div x-show="tab === 'upload'" x-transition>
            <input type="hidden" name="image_source" value="upload" x-bind:value="tab">
            <input type="file" name="image_file" accept="image/png,image/jpeg,image/webp"
                class="block w-full text-sm text-slate-600
                       file:mr-3 file:py-2.5 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-bold file:uppercase file:tracking-wider
                       file:bg-primary-500 file:text-white
                       hover:file:bg-primary-600 file:cursor-pointer cursor-pointer">
            <p class="text-xs text-slate-400 mt-2">JPG / PNG / WebP, up to 5 MB.</p>
        </div>

        <div x-show="tab === 'url'" x-transition x-cloak>
            <input type="text" name="image_url" value="{{ old('image_url', $car?->image_url && !str_contains($car->image_url, '/storage/cars/') ? $car->image_url : '') }}"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition font-mono"
                placeholder="https://…">
            <p class="text-xs text-slate-400 mt-2">Direct URL to a publicly accessible JPG/PNG/WebP.</p>
        </div>

        @if ($car?->image_url)
            <div class="mt-3 pt-3 border-t border-slate-200">
                <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Current</div>
                <img src="{{ $car->image_url }}" alt="" class="w-32 h-20 rounded-lg object-cover bg-slate-200">
                <p class="text-xs text-slate-400 mt-1.5">Leave both fields empty to keep this image.</p>
            </div>
        @endif
    </div>
</div>

<style>[x-cloak] { display: none !important; }</style>
