import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export const USD = 'USD';
export const UAH = 'UAH';

const DISPLAY_CURRENCY_STORAGE_KEY = 'inventory.display_currency';

export function convertPrice(value, { fromCurrency = USD, toCurrency = USD, usdToUahRate = null } = {}) {
    if (value == null || value === '') {
        return null;
    }

    const amount = Number(value);
    const rate = Number(usdToUahRate);

    if (!Number.isFinite(amount)) {
        return null;
    }

    if (fromCurrency === toCurrency) {
        return amount;
    }

    if (!Number.isFinite(rate) || rate <= 0) {
        return null;
    }

    if (fromCurrency === USD && toCurrency === UAH) {
        return amount * rate;
    }

    if (fromCurrency === UAH && toCurrency === USD) {
        return amount / rate;
    }

    return null;
}

export function formatPrice(
    value,
    { sourceCurrency = USD, displayCurrency = sourceCurrency, usdToUahRate = null } = {}
) {
    const amount = convertPrice(value, {
        fromCurrency: sourceCurrency,
        toCurrency: displayCurrency,
        usdToUahRate,
    });

    if (amount == null) {
        return null;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: displayCurrency,
        currencyDisplay: 'code',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatPriceInput(
    value,
    { sourceCurrency = USD, displayCurrency = sourceCurrency, usdToUahRate = null } = {}
) {
    const amount = convertPrice(value, {
        fromCurrency: sourceCurrency,
        toCurrency: displayCurrency,
        usdToUahRate,
    });

    if (amount == null) {
        return '';
    }

    return Number(amount)
        .toFixed(2)
        .replace(/\.00$/, '')
        .replace(/(\.\d)0$/, '$1');
}

function readStoredDisplayCurrency() {
    if (typeof window === 'undefined') {
        return USD;
    }

    return window.localStorage.getItem(DISPLAY_CURRENCY_STORAGE_KEY) === UAH ? UAH : USD;
}

export function useDisplayCurrency() {
    const currency = usePage().props.currency ?? {};
    const usdToUahRate = currency?.nbu?.usd_to_uah_rate ?? null;
    const canDisplayUah = Number.isFinite(Number(usdToUahRate)) && Number(usdToUahRate) > 0;
    const [displayCurrency, setDisplayCurrency] = useState(readStoredDisplayCurrency);

    useEffect(() => {
        if (!canDisplayUah && displayCurrency === UAH) {
            setDisplayCurrency(USD);
        }
    }, [canDisplayUah, displayCurrency]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(DISPLAY_CURRENCY_STORAGE_KEY, displayCurrency);
    }, [displayCurrency]);

    return {
        displayCurrency,
        setDisplayCurrency,
        usdToUahRate,
        canDisplayUah,
    };
}
