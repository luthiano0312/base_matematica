#!/bin/bash
set -e

# Render injeta a porta em $PORT. Localmente, cai no 8080 como default.
export PORT="${PORT:-8080}"

echo "Gerando nginx.conf para a porta ${PORT}..."
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

cd /var/www/html

# Garante que o APP_KEY e as configs estão atualizadas em cada boot
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrations automáticas no start do container são opcionais e desligadas por padrão —
# o recomendado é usar o "Pre-Deploy Command" do Render (php artisan migrate --force).
# Para ligar aqui em vez disso, defina RUN_MIGRATIONS_ON_BOOT=true nas env vars do serviço.
if [ "${RUN_MIGRATIONS_ON_BOOT}" = "true" ]; then
    echo "RUN_MIGRATIONS_ON_BOOT=true — rodando migrations..."
    php artisan migrate --force
fi

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
