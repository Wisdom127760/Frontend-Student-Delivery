import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
        default: 'bg-white border border-gray-200',
        elevated: 'bg-white shadow-lg border-0',
        outlined: 'bg-white border-2 border-gray-200',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            ref={ref}
            className={cn(
                'rounded-xl transition-all duration-200',
                variants[variant],
                paddings[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5 pb-4', className)}
            {...props}
        >
            {children}
        </div>
    );
});

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <h3
            ref={ref}
            className={cn('text-lg font-semibold text-gray-900', className)}
            {...props}
        >
            {children}
        </h3>
    );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <p
            ref={ref}
            className={cn('text-sm text-gray-600', className)}
            {...props}
        >
            {children}
        </p>
    );
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn('pt-0', className)}
            {...props}
        >
            {children}
        </div>
    );
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn('flex items-center pt-4', className)}
            {...props}
        >
            {children}
        </div>
    );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
