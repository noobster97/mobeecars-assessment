<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-50">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Admin' }} · Mobee Cars</title>
    <link rel="icon" type="image/png" href="{{ asset('images/mobee-logo.png') }}">
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50:  '#FEF2F2',
                            100: '#FEE2E2',
                            500: '#EF4444',
                            600: '#DC2626',
                            700: '#B91C1C',
                        }
                    }
                }
            }
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', system-ui, sans-serif; }</style>
</head>
<body class="h-full text-slate-900 antialiased">

@auth
    @if(auth()->user()->is_admin)
        @php $route = request()->route()?->getName(); @endphp

        <div x-data="{ open: false }" class="min-h-screen">

            {{-- Mobile top bar --}}
            <header class="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200">
                <div class="flex items-center justify-between px-4 h-14">
                    <a href="{{ route('admin.overview') }}" class="flex items-center gap-2">
                        <img src="{{ asset('images/mobee-logo.png') }}" alt="Mobee" class="h-7">
                        <span class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-slate-900 text-white rounded">Admin</span>
                    </a>
                    <button @click="open = !open" class="p-2 -mr-2 text-slate-700 hover:text-primary-600">
                        <svg x-show="!open" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                        <svg x-show="open" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </header>

            {{-- Mobile drawer overlay --}}
            <div x-show="open" x-transition.opacity @click="open = false" class="md:hidden fixed inset-0 bg-slate-900/40 z-40" style="display: none;"></div>

            {{-- Sidebar --}}
            <aside
                x-bind:class="open ? 'translate-x-0' : '-translate-x-full'"
                class="fixed md:translate-x-0 md:static md:inset-auto inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-out"
            >
                <div class="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <a href="{{ route('admin.overview') }}" class="flex items-center gap-2">
                        <img src="{{ asset('images/mobee-logo.png') }}" alt="Mobee" class="h-8">
                        <span class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-slate-900 text-white rounded">Admin</span>
                    </a>
                    <button @click="open = false" class="md:hidden p-1 text-slate-400 hover:text-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <nav class="flex-1 px-3 py-5 space-y-1">
                    @php
                        $nav = [
                            ['label' => 'Overview', 'route' => 'admin.overview', 'icon' => 'overview'],
                            ['label' => 'Users',    'route' => 'admin.users.index', 'icon' => 'users', 'match' => 'admin.users.'],
                            ['label' => 'Cars',     'route' => 'admin.cars.index',  'icon' => 'cars',  'match' => 'admin.cars.'],
                        ];
                    @endphp
                    @foreach($nav as $item)
                        @php
                            $active = $route === $item['route'] || (isset($item['match']) && str_starts_with((string) $route, $item['match']));
                        @endphp
                        <a href="{{ route($item['route']) }}"
                           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition
                                  {{ $active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">
                            @if($item['icon'] === 'overview')
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                            @elseif($item['icon'] === 'users')
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            @elseif($item['icon'] === 'cars')
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17l-3-7h14l-3 7M8 17v3m0-3h8m0 0v3M5 10V8a3 3 0 013-3h8a3 3 0 013 3v2"/></svg>
                            @endif
                            {{ $item['label'] }}
                        </a>
                    @endforeach
                </nav>

                <div class="px-3 py-4 border-t border-slate-200">
                    <div class="px-3 py-2 mb-1 text-xs text-slate-500">
                        <div class="font-semibold text-slate-700 truncate">{{ auth()->user()->name }}</div>
                        <div class="truncate">{{ auth()->user()->email }}</div>
                    </div>
                    <form method="POST" action="{{ route('admin.logout') }}">
                        @csrf
                        <button type="submit" class="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {{-- Main content --}}
            <main class="md:ml-72 px-5 md:px-8 py-6 md:py-8 max-w-6xl">
                @yield('content')
            </main>
        </div>
    @else
        <main class="px-5 py-8 max-w-6xl mx-auto">@yield('content')</main>
    @endif
@else
    <main class="px-5 py-8">@yield('content')</main>
@endauth

</body>
</html>
