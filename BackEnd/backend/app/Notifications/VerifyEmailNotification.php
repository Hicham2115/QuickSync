<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends VerifyEmail
{
    protected function buildMailMessage($url): MailMessage
    {
        return (new MailMessage)
            ->subject('Confirmez votre adresse e-mail — WorkSync')
            ->greeting('Bienvenue sur WorkSync !')
            ->line('Merci de votre inscription. Pour activer votre compte et accéder à votre tableau de bord, veuillez confirmer votre adresse e-mail.')
            ->action('Vérifier mon adresse e-mail', $url)
            ->line('Ce lien de vérification expirera dans **60 minutes**.')
            ->line("Si vous n'avez pas créé de compte WorkSync, aucune action n'est requise.")
            ->salutation('— L\'équipe WorkSync');
    }
}
