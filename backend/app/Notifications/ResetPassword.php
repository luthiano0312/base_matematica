<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPassword extends BaseResetPassword
{
    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable): MailMessage
    {
        $minutes = (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);

        return (new MailMessage)
            ->subject('Redefinição de senha')
            ->view('emails.password-reset', [
                'name' => $notifiable->name,
                'resetUrl' => $this->resetUrl($notifiable),
                'minutes' => $minutes,
            ]);
    }

    /**
     * Get the reset URL pointing to the frontend.
     *
     * @param  mixed  $notifiable
     */
    protected function resetUrl($notifiable): string
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');

        return $frontendUrl.'/reset-password'
            .'?token='.$this->token
            .'&email='.urlencode((string) $notifiable->getEmailForPasswordReset());
    }
}
