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
        if (isOpen) {
            // Hide navigation when bottom sheet opens
            const nav = document.querySelector('nav') as HTMLElement;
            if (nav) {
                nav.style.transform = 'translateY(100%)';
                nav.style.transition = 'transform 0.3s ease-out';
            }

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            // Show navigation when bottom sheet closes
            const nav = document.querySelector('nav') as HTMLElement;
            if (nav) {
                nav.style.transform = 'translateY(0)';
            }

            // Restore body scroll
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }

        return () => {
            // Cleanup - show nav and restore scroll
            const nav = document.querySelector('nav') as HTMLElement;
            if (nav) {
                nav.style.transform = 'translateY(0)';
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
                className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl z-[9999] animate-in slide-in-from-bottom duration-300"
                style={{
                    height: 'calc(100vh - 60px)',
                    top: '60px'
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
                <div className="overflow-y-auto px-6 pb-6 h-[calc(100%-60px)]">
                    {children}
                </div>
            </div>
        </>
    );
};

export default BottomSheet;
