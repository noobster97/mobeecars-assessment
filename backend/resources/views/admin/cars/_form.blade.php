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
    <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Image URL</label>
        <input type="url" name="image_url" value="{{ old('image_url', $car?->image_url) }}" required
            class="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition font-mono"
            placeholder="https://…">
        <p class="text-xs text-slate-400 mt-1.5">Direct URL to a publicly accessible JPG/PNG.</p>
    </div>
</div>
