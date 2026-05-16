<?php

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\CarController as AdminCarController;
use App\Http\Controllers\Admin\OverviewController as AdminOverviewController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('admin.login'));

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AdminAuthController::class, 'showLogin'])->name('login');
    Route::post('login', [AdminAuthController::class, 'login'])->name('login.submit');
    Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');

    Route::middleware(['auth', EnsureAdmin::class])->group(function () {
        Route::get('/', AdminOverviewController::class)->name('overview');

        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('users/{user}', [AdminUserController::class, 'show'])->name('users.show');

        Route::get('cars',                [AdminCarController::class, 'index'])->name('cars.index');
        Route::get('cars/create',         [AdminCarController::class, 'create'])->name('cars.create');
        Route::post('cars',               [AdminCarController::class, 'store'])->name('cars.store');
        Route::get('cars/{car}/edit',     [AdminCarController::class, 'edit'])->name('cars.edit');
        Route::patch('cars/{car}',        [AdminCarController::class, 'update'])->name('cars.update');
        Route::delete('cars/{car}',       [AdminCarController::class, 'destroy'])->name('cars.destroy');
    });
});
