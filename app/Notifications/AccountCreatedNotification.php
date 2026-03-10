<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public string $temporaryPassword
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $loginUrl = url('/login');

        return (new MailMessage)
            ->subject('Your BarfFoods Account')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('We created an account for you so you can track your order and shop again easily.')
            ->line('Email: ' . $notifiable->email)
            ->line('Temporary password: ' . $this->temporaryPassword)
            ->action('Log in', $loginUrl)
            ->line('We recommend changing your password after you log in.')
            ->line('Thank you for shopping with BarfFoods!');
    }
}
