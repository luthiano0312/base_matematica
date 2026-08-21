FROM php:8.4-fpm-alpine

# --- Dependências de sistema e extensões PHP exigidas pelo Laravel + Postgres (Supabase) ---
RUN apk add --no-cache \
        nginx \
        supervisor \
        git \
        curl \
        libpng-dev \
        libzip-dev \
        oniguruma-dev \
        postgresql-dev \
        bash \
        gettext \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        zip \
        gd \
        bcmath

# --- Composer ---
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# --- Instala dependências PHP primeiro (cache de camada) ---
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# --- Copia o restante do código ---
COPY . .

RUN composer dump-autoload --optimize \
    && php artisan config:clear

# --- Permissões de storage/cache (Laravel precisa de escrita aqui) ---
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# --- Configs de Nginx (template) e Supervisor ---
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Render injeta a porta real via env var $PORT em runtime — não fixamos EXPOSE a um valor específico aqui
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
