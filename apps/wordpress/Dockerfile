# syntax=docker/dockerfile:1
FROM php:8.5-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libfreetype-dev \
        libicu-dev \
        libjpeg-dev \
        libpng-dev \
        libwebp-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j "$(nproc)" exif gd intl mysqli zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer/composer:2-bin /composer /usr/local/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
COPY config/ ./config/
COPY --exclude=wp --exclude=app/uploads web/ ./web/

RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --no-interaction --no-progress \
    && composer check-platform-reqs --no-dev \
    && install -d -o www-data -g www-data web/app/uploads

RUN <<'SHELL'
set -eu
a2enmod rewrite
cat > /etc/apache2/sites-available/000-default.conf <<'APACHE'
<VirtualHost *:80>
    DocumentRoot /var/www/html/web

    <Directory /var/www/html/web>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted

        RewriteEngine On
        RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.php [L]
    </Directory>

    <Directory /var/www/html/web/app/uploads>
        <FilesMatch "\.php$">
            Require all denied
        </FilesMatch>
    </Directory>
</VirtualHost>
APACHE
apache2ctl configtest
SHELL
