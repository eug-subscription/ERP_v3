import { useState, useEffect } from 'react';

/**
 * Hook to track media query state.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}

/**
 * Hook to track common responsive breakpoints.
 */
export function useResponsive() {
    const isDesktop = useMediaQuery('(min-width: 1280px)');
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
    const isMobile = useMediaQuery('(max-width: 767px)');

    return { isDesktop, isTablet, isMobile };
}
