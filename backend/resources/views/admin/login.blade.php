@extends('layouts.admin', ['title' => 'Sign in'])

@section('content')
<div class="min-h-[calc(100vh-4rem)] -mt-8 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <div class="text-5xl font-black text-primary-500 tracking-tight mb-2">///mobee</div>
            <h1 class="text-xl font-bold text-slate-900">Admin sign in</h1>
            <p class="text-sm text-slate-500 mt-1">Mobee Cars internal dashboard</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            @if ($errors->any())
                <div class="mb-5 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="POST" action="{{ route('admin.login.submit') }}" class="space-y-4">
                @csrf
                <div>
                    <label for="email" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
                    <input id="email" name="email" type="email" required autofocus
                        value="{{ old('email') }}"
                        class="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="admin@mobeecars.test">
                </div>
                <div>
                    <label for="password" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                    <input id="password" name="password" type="password" required
                        class="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="••••••••">
                </div>
                <label class="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" name="remember" class="rounded border-slate-300 text-primary-500 focus:ring-primary-500">
                    Remember me
                </label>
                <button type="submit"
                    class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg transition shadow-sm">
                    Sign in
                </button>
            </form>
        </div>

        <p class="text-center text-xs text-slate-400 mt-6">
            Demo credentials: <span class="font-mono">admin@mobeecars.test</span> / <span class="font-mono">password</span>
        </p>
    </div>
</div>
@endsection
