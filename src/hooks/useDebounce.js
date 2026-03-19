import { useEffect, useState } from "react";

const useDebounce = (value, duration = 500) => {
    const [debounceValue, setDebounceValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceValue(value);
        }, duration);
        return () => {
            clearTimeout(timer);
        };
    }, [value]);
    return debounceValue;
};

export default useDebounce;
