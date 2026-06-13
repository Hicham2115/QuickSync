<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    protected function buildMailMessage($url): MailMessage
    {
        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe — WorkSync')
            ->greeting('Bonjour !')
            ->line('Vous recevez cet e-mail car nous avons reçu une demande de réinitialisation du mot de passe associé à votre compte.')
            ->action('Réinitialiser mon mot de passe', $url)
            ->line('Ce lien expirera dans **60 minutes**.')
            ->line("Si vous n'êtes pas à l'origine de cette demande, aucune action n'est requise.")
            ->salutation('— L\'équipe WorkSync');
    }
}
