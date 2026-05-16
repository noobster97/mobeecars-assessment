<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-50">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Admin' }} · Mobee Cars</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
            <nav class="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <a href="{{ route('admin.users.index') }}" class="flex items-center gap-2 group">
                            <span class="text-2xl font-black text-primary-500 tracking-tight leading-none">///mobee</span>
                            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white rounded">Admin</span>
                        </a>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-slate-500">{{ auth()->user()->email }}</span>
                        <form method="POST" action="{{ route('admin.logout') }}">
                            @csrf
                            <button type="submit" class="text-sm font-semibold text-slate-700 hover:text-primary-600 transition">
                                Sign out
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
        @endif
    @endauth

    <main class="max-w-7xl mx-auto px-6 py-8">
        {{ $slot ?? '' }}
        @yield('content')
    </main>
</body>
</html>
