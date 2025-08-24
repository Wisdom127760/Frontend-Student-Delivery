import React, { useEffect, useState } from 'react';

const PageTransition = ({ children, isVisible = true, delay = 0 }) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setShouldRender(true);
            }, delay);
            return () => clearTimeout(timer);
        } else {
            setShouldRender(false);
        }
    }, [isVisible, delay]);

    if (!shouldRender) {
        return null;
    }

    return (
        <div className={`
            transition-all duration-1000 ease-in-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
            {children}
        </div>
    );
};

export default PageTransition;
