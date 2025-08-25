import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/loading-animation.json';

const LottieLoader = ({
    size = 'md',
    className = '',
    showText = false,
    text = 'Loading...',
    textColor = 'text-gray-600',
    loop = true,
    autoplay = true,
    layout = 'vertical' // 'vertical' or 'horizontal'
}) => {
    const sizeClasses = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const isHorizontal = layout === 'horizontal';

    return (
        <div className={`flex ${isHorizontal ? 'flex-row items-center' : 'flex-col items-center justify-center'} ${className}`}>
            <div className={sizeClasses[size]}>
                <Lottie
                    animationData={loadingAnimation}
                    loop={loop}
                    autoplay={autoplay}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            {showText && (
                <span className={`${isHorizontal ? 'ml-2' : 'mt-2'} text-sm animate-pulse ${textColor}`}>
                    {text}
                </span>
            )}
        </div>
    );
};

export default LottieLoader;
