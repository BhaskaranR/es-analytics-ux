import React from 'react';

import { Button, ButtonProps } from 'react-bootstrap';

interface SubmitButtonProps extends ButtonProps {
    children: React.ReactNode;
    isSubmitting: boolean;
    disabled?: boolean;
}

const CustomSpinner = () => (
    <div className='spinner-border spinner-border-sm' role='status'>
        <span className='visually-hidden'>Loading...</span>
    </div>
);

export function SubmitButton({ children, isSubmitting, disabled, ...props }: SubmitButtonProps) {
    return (
        <Button disabled={isSubmitting || disabled} {...props} style={{ position: 'relative' }}>
            <span style={{ visibility: isSubmitting ? 'hidden' : 'visible' }}>{children}</span>
            {isSubmitting && (
                <span
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                    <CustomSpinner />
                </span>
            )}
        </Button>
    );
}
