import { useState, useEffect } from 'react';

export function usePersistedState<T>(key: string, initialValue: T) {
    // Get stored value from localStorage
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    // Update localStorage when value changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    }, [key, value]);

    return [value, setValue] as const;
} 