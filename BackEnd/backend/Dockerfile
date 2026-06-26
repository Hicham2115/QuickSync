FROM php:8.4-cli

RUN docker-php-ext-install pdo pdo_mysql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --prefer-dist

COPY . .

RUN composer dump-autoload --optimize

EXPOSE 8000

CMD rm -f .env \
    && until php -r "try{new PDO('mysql:host=db;port=3306;dbname=QuickSync','root','secret');echo 'ok';}catch(Exception \$e){exit(1);}" 2>/dev/null | grep -q ok; do echo "Waiting for MySQL..."; sleep 2; done \
    && php artisan config:clear \
    && php artisan migrate --force \
    && php artisan serve --host=0.0.0.0 --port=8000
