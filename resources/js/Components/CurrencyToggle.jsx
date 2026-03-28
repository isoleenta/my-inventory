import { useDisplayCurrency } from '@/lib/currency';

const baseClass =
    'inline-flex h-8 min-w-[3.25rem] items-center justify-center rounded-md px-3 text-xs font-semibold transition';

export default function CurrencyToggle() {
    const { displayCurrency, setDisplayCurrency, canDisplayUah } = useDisplayCurrency();

    return (
        <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium uppercase tracking-wide text-gray-500 md:inline">
                Prices
            </span>
            <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
                <button
                    type="button"
                    onClick={() => setDisplayCurrency('USD')}
                    className={`${baseClass} ${
                        displayCurrency === 'USD'
                            ? 'bg-primary text-black'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    USD
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (canDisplayUah) {
                            setDisplayCurrency('UAH');
                        }
                    }}
                    disabled={!canDisplayUah}
                    title={canDisplayUah ? 'Display prices in UAH' : 'UAH display is unavailable until the NBU rate is loaded'}
                    className={`${baseClass} ${
                        displayCurrency === 'UAH'
                            ? 'bg-primary text-black'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    UAH
                </button>
            </div>
        </div>
    );
}
