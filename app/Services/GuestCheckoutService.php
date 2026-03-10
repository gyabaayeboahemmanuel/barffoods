<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\AccountCreatedNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GuestCheckoutService
{
    /**
     * Find user by email or create new user with generated password.
     * For new users, sends email with the generated password.
     *
     * @return array{0: User, 1: bool} [user, wasCreated]
     */
    public function findOrCreateUserByEmail(string $email, ?string $name = null): array
    {
        $email = strtolower(trim($email));
        $user = User::where('email', $email)->first();

        if ($user) {
            return [$user, false];
        }

        $password = Str::random(16);
        $user = User::create([
            'name' => trim($name ?? 'Customer'),
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $user->notify(new AccountCreatedNotification($user, $password));

        return [$user, true];
    }
}
