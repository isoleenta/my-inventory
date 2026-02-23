export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-green/50 bg-black-light text-green focus:ring-green focus:ring-offset-0 ' +
                className
            }
        />
    );
}
