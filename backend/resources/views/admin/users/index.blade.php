@extends('layouts.admin', ['title' => 'Users'])

@section('content')
<div class="mb-6">
    <h1 class="text-3xl font-black tracking-tight">Users</h1>
    <p class="text-sm text-slate-500 mt-1">All registered users on Mobee Cars</p>
</div>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total users</div>
        <div class="text-3xl font-black text-slate-900 mt-1">{{ $totals['users'] }}</div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500">Admins</div>
        <div class="text-3xl font-black text-slate-900 mt-1">{{ $totals['admins'] }}</div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total swipes</div>
        <div class="text-3xl font-black text-slate-900 mt-1">{{ $totals['swipes'] }}</div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500">Likes</div>
        <div class="text-3xl font-black text-emerald-600 mt-1">{{ $totals['likes'] }}</div>
    </div>
</div>

<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
                <th class="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">User</th>
                <th class="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Role</th>
                <th class="text-right px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Swipes</th>
                <th class="text-right px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Liked</th>
                <th class="text-right px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Skipped</th>
                <th class="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Joined</th>
                <th class="px-6 py-3"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse ($users as $u)
                <tr class="hover:bg-slate-50 transition">
                    <td class="px-6 py-4">
                        <div class="font-semibold text-slate-900">{{ $u->name }}</div>
                        <div class="text-xs text-slate-500">{{ $u->email }}</div>
                    </td>
                    <td class="px-6 py-4">
                        @if($u->is_admin)
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white">Admin</span>
                        @else
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600">User</span>
                        @endif
                    </td>
                    <td class="px-6 py-4 text-right font-semibold tabular-nums">{{ $u->likes_count }}</td>
                    <td class="px-6 py-4 text-right font-semibold tabular-nums text-emerald-600">{{ $u->liked_count }}</td>
                    <td class="px-6 py-4 text-right font-semibold tabular-nums text-red-600">{{ $u->disliked_count }}</td>
                    <td class="px-6 py-4 text-xs text-slate-500">{{ $u->created_at?->format('M j, Y') }}</td>
                    <td class="px-6 py-4 text-right">
                        <a href="{{ route('admin.users.show', $u) }}" class="text-sm font-semibold text-primary-600 hover:text-primary-700">
                            View &rarr;
                        </a>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-slate-400">No users yet.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if ($users->hasPages())
    <div class="mt-6">
        {{ $users->links() }}
    </div>
@endif
@endsection
