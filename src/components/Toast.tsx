// Toast Notification Component
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onHide: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    isVisible,
    onHide,
    duration = 2000
}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onHide, 300); // Wait for animation to complete
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onHide]);

    if (!isVisible && !show) return null;

    return (
        <div
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 
                        flex items-center gap-2 px-4 py-3 
                        bg-primary text-primary-foreground 
                        rounded-lg shadow-lg
                        transition-all duration-300
                        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};

// Toast hook for easy usage
interface ToastState {
    message: string;
    isVisible: boolean;
}

export function useToast() {
    const [toast, setToast] = useState<ToastState>({ message: '', isVisible: false });

    const showToast = (message: string) => {
        setToast({ message, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    return { toast, showToast, hideToast };
}
