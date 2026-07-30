import { usePage } from '@inertiajs/react';

/**
 * Global Translation Helper.
 * Translates a key based on shared Inertia data.
 */
export function __(key) {
    const { translations } = usePage().props;
    
    // If the translation key exists, return it; otherwise, fallback to the original key string
    return translations[key] || key;
}