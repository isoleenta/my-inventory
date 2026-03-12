#!/bin/sh

php artisan migrate --force --seed --isolated

php artisan octane:start --port=8080 --host=0.0.0.0 --rr-config=.rr.yaml