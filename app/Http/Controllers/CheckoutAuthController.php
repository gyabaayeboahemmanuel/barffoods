<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AnonymousCart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Features;

class CheckoutAuthController extends Controller
{
    /**
     * Sign in or create account at checkout (single form: email + password, optional name for new users).
     * Tries login first; if email not found and name provided, registers then logs in.
     * Migrates anonymous cart to user after successful auth.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'password' => ['required', 'string'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $email = $request->input('email');
        $password = $request->input('password');
        $name = $request->input('name');

        $this->ensureIsNotRateLimited($email, $request);

        $user = User::where('email', $email)->first();

        if ($user) {
            // Try login
            if (! Auth::getProvider()->validateCredentials($user, ['email' => $email, 'password' => $password])) {
                RateLimiter::hit($this->throttleKey($email, $request));
                throw ValidationException::withMessages([
                    'email' => __('auth.failed'),
                ]);
            }
            if (! $user->is_active) {
                throw ValidationException::withMessages([
                    'email' => 'Your account has been deactivated. Please contact support.',
                ]);
            }
            if (Features::enabled(Features::twoFactorAuthentication()) && $user->hasEnabledTwoFactorAuthentication()) {
                $request->session()->put([
                    'login.id' => $user->getKey(),
                    'login.remember' => false,
                ]);
                return redirect()->route('two-factor.login')->with('redirect', '/checkout');
            }
            Auth::login($user, false);
        } else {
            // New user: require name to register
            if (empty(trim((string) $name))) {
                throw ValidationException::withMessages([
                    'name' => 'Enter your name to create an account with this email.',
                ]);
            }
            $user = User::create([
                'name' => trim($name),
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'customer',
                'is_active' => true,
            ]);
            Auth::login($user, false);
        }

        RateLimiter::clear($this->throttleKey($email, $request));
        $this->migrateAnonymousCart($user->id);
        $token = $user->createToken('web-cart-token')->plainTextToken;
        $request->session()->put('sanctum_token', $token);
        $request->session()->regenerate();

        return redirect()->intended(route('checkout.index', [], false));
    }

    private function ensureIsNotRateLimited(string $email, Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($email, $request), 5)) {
            return;
        }
        $seconds = RateLimiter::availableIn($this->throttleKey($email, $request));
        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => (int) ceil($seconds / 60),
            ]),
        ]);
    }

    private function throttleKey(string $email, Request $request): string
    {
        return strtolower($email) . '|' . $request->ip();
    }

    private function migrateAnonymousCart(int $userId): void
    {
        try {
            $sessionId = Session::getId();
            $anonymousCart = AnonymousCart::where('session_id', $sessionId)->first();
            if ($anonymousCart && ! empty($anonymousCart->cart_data)) {
                $anonymousCart->migrateToUser($userId);
            }
        } catch (\Exception $e) {
            report($e);
        }
    }
}
