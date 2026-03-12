#!/bin/sh

composer install --no-interaction --prefer-dist --optimize-autoloader

npm i

php artisan octane:start --port=8080 --host=0.0.0.0 --rr-config=.rr.yaml --watch