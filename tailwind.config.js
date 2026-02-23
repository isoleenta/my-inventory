import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                black: {
                    DEFAULT: '#0a0a0a',
                    light: '#171717',
                },
                green: {
                    DEFAULT: '#22c55e',
                    dark: '#15803d',
                    light: '#4ade80',
                },
            },
        },
    },

    plugins: [forms],
};
