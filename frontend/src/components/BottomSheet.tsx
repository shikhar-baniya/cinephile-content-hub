import { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

const BottomSheet = ({ isOpen, onClose, children, title }: BottomSheetProps) => {
    useEffect(() => {
        const navElement = typeof document !== 'undefined'
            ? (document.querySelector('[data-mobile-nav]') as HTMLElement | null)
            : null;

        if (navElement && !navElement.dataset.originalBottom) {
            navElement.dataset.originalBottom = getComputedStyle(navElement).bottom;
        }

        if (isOpen) {
            // Hide mobile navigation when bottom sheet opens
            if (navElement) {
                const originalBottom = navElement.dataset.originalBottom || '1.5rem';
                navElement.style.transition = 'bottom 0.3s ease-out, opacity 0.3s ease-out';
                navElement.style.bottom = `calc(-1 * ${originalBottom} - 80px)`;
                navElement.style.opacity = '0';
                navElement.style.pointerEvents = 'none';
            }

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            // Show navigation when bottom sheet closes
            if (navElement) {
                const originalBottom = navElement.dataset.originalBottom || '';
                navElement.style.bottom = originalBottom;
                navElement.style.opacity = '1';
                navElement.style.pointerEvents = '';
            }

            // Restore body scroll
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }

        return () => {
            const currentNav = typeof document !== 'undefined'
                ? (document.querySelector('[data-mobile-nav]') as HTMLElement | null)
                : null;
            if (currentNav) {
                const originalBottom = currentNav.dataset.originalBottom || '';
                currentNav.style.bottom = originalBottom;
                currentNav.style.opacity = '1';
                currentNav.style.pointerEvents = '';
            }
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Bottom Sheet */}
            <div
                className="fixed bottom-0 left-0 right-0 bg-card/95 rounded-t-3xl border border-primary/20 z-[9999] animate-in slide-in-from-bottom duration-300 flex flex-col backdrop-blur-xl"
                style={{
                    top: '60px',
                    maxHeight: 'calc(100vh - 60px)',
                    boxShadow: '0 -20px 45px hsl(var(--primary) / 0.35)'
                }}
            >
                {/* Header with close button */}
                <div className="flex flex-col pt-3 pb-2">
                    <div className="flex items-center justify-between px-6 pb-2">
                        {title && <h2 className="text-lg font-bold">{title}</h2>}
                        <button
                            onClick={onClose}
                            className="ml-auto p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 flex-1 overflow-y-auto overscroll-contain">
                    {children}
                </div>
            </div>
        </>
    );
};

export default BottomSheet;
