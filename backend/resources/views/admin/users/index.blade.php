@extends('layouts.admin', ['title' => 'Users'])

@section('content')
<div class="mb-6">
    <h1 class="text-3xl font-black tracking-tight">Users</h1>
    <p class="text-sm text-slate-500 mt-1">All registered users on Mobee Cars</p>
</div>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
    <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
        <div class="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">Total users</div>
        <div class="text-2xl md:text-3xl font-black text-slate-900 mt-1 tabular-nums">{{ $totals['users'] }}</div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
        <div class="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">Admins</div>
        <div class="text-2xl md:text-3xl font-black text-slate-900 mt-1 tabular-nums">{{ $totals['admins'] }}</div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
        <div class="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">Total swipes</div>
        <div class="text-2xl md:text-3xl font-black text-slate-900 mt-1 tabular-nums">{{ $totals['swipes'] }}</div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
        <div class="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500">Likes</div>
        <div class="text-2xl md:text-3xl font-black text-emerald-600 mt-1 tabular-nums">{{ $totals['likes'] }}</div>
    </div>
</div>

@if ($users->isEmpty())
    <div class="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-400">No users yet.</div>
@else
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
        @foreach ($users as $u)
            <a href="{{ route('admin.users.show', $u) }}"
               class="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-4 hover:bg-slate-50 transition active:bg-slate-100">
                <div class="w-10 h-10 md:w-11 md:h-11 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-black flex-shrink-0">
                    {{ strtoupper(substr($u->name, 0, 1)) }}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-bold text-slate-900 truncate">{{ $u->name }}</span>
                        @if($u->is_admin)
                            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-900 text-white">Admin</span>
                        @endif
                    </div>
                    <div class="text-xs text-slate-500 truncate">{{ $u->email }}</div>
                    <div class="flex items-center gap-3 mt-1.5 text-xs">
                        <span class="text-slate-500">
                            <span class="font-bold tabular-nums text-slate-700">{{ $u->likes_count }}</span> swipes
                        </span>
                        <span class="text-emerald-600">
                            <span class="font-bold tabular-nums">{{ $u->liked_count }}</span> liked
                        </span>
                        <span class="text-red-500">
                            <span class="font-bold tabular-nums">{{ $u->disliked_count }}</span> skipped
                        </span>
                    </div>
                </div>
                <svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            </a>
        @endforeach
    </div>

    @if ($users->hasPages())
        <div class="mt-6">{{ $users->links() }}</div>
    @endif
@endif
@endsection
