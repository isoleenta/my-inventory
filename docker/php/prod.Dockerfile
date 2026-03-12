# ----------------------------
# 🧱 Base RoadRunner binary
# ----------------------------
FROM ghcr.io/roadrunner-server/roadrunner:2025.1.2 AS roadrunner

# ----------------------------
# ⚙️ Node.js (used by Vite or frontend tooling)
# ----------------------------
FROM node:22.2.0-slim AS nodejs

# ----------------------------
# 🐘 PHP base image (CLI)
# ----------------------------
FROM php:8.4-cli AS base

# ----------------------------
# 🧩 System dependencies
# ----------------------------
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    git curl unzip zip libzip-dev \
    libonig-dev libxml2-dev libicu-dev libpq-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# ----------------------------
# 🧱 PHP extensions (Laravel 12 requirements only)
# ----------------------------
RUN docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    xml \
    pcntl \
    zip \
    intl

# ----------------------------
# 🚀 Redis extension
# ----------------------------
RUN pecl install redis && docker-php-ext-enable redis

# ----------------------------
# 🔥 Sockets extension (required for Laravel Octane)
# ----------------------------
RUN docker-php-ext-install sockets

# ----------------------------
# ⚙️ Node.js & npm & RoadRunner
# ----------------------------
COPY --from=roadrunner /usr/bin/rr /usr/local/bin/rr
COPY --from=nodejs /usr/local/bin/node /usr/local/bin/node
COPY --from=nodejs /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

# ----------------------------
# 🎼 Composer
# ----------------------------
RUN curl -sS https://getcomposer.org/installer | php && \
    mv composer.phar /usr/local/bin/composer

# ----------------------------
# 👤 Application user
# ----------------------------
RUN groupadd -g 1000 www && \
    useradd -u 1000 -ms /bin/bash -g www www

# ----------------------------
# 📁 Copy application source
# ----------------------------
COPY ./ /var/www/app
COPY ./docker/php/.bashrc /home/www/.bashrc
COPY ./docker/php/php.ini /usr/local/etc/php/php.ini

# ----------------------------
# ⚙️ Set working directory
# ----------------------------
WORKDIR /var/www/app

# ----------------------------
# 📦 Install Composer dependencies (prod only)
# ----------------------------
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# ----------------------------
# 🔐 Fix permissions
# ----------------------------
RUN chown www:www ./ -R && chmod 775 ./ -R

# ----------------------------
# 🧪 Create default .env
# ----------------------------
USER www
RUN cp .env.example .env

# ----------------------------
# 🚪 Expose default RoadRunner port
# ----------------------------
EXPOSE 8080

# ----------------------------
# 🚀 Entrypoint script
# ----------------------------
ENTRYPOINT ["/var/www/app/docker/php/prod-entrypoint.sh"]