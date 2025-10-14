import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    snapPoints?: number[]; // Heights in vh: [30, 60, 90]
}

const BottomSheet = ({ isOpen, onClose, children, title, snapPoints = [60, 90] }: BottomSheetProps) => {
    const [currentSnapPoint, setCurrentSnapPoint] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            setCurrentSnapPoint(0); // Start at first snap point
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
        setCurrentY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        setCurrentY(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const deltaY = currentY - startY;
        const threshold = 50;

        if (deltaY > threshold) {
            // Dragged down
            if (currentSnapPoint === 0) {
                onClose();
            } else {
                setCurrentSnapPoint(Math.max(0, currentSnapPoint - 1));
            }
        } else if (deltaY < -threshold) {
            // Dragged up
            setCurrentSnapPoint(Math.min(snapPoints.length - 1, currentSnapPoint + 1));
        }

        setCurrentY(0);
        setStartY(0);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartY(e.clientY);
        setCurrentY(e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        setCurrentY(e.clientY);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const deltaY = currentY - startY;
        const threshold = 50;

        if (deltaY > threshold) {
            if (currentSnapPoint === 0) {
                onClose();
            } else {
                setCurrentSnapPoint(Math.max(0, currentSnapPoint - 1));
            }
        } else if (deltaY < -threshold) {
            setCurrentSnapPoint(Math.min(snapPoints.length - 1, currentSnapPoint + 1));
        }

        setCurrentY(0);
        setStartY(0);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    if (!isOpen) return null;

    const dragOffset = isDragging ? currentY - startY : 0;
    const height = snapPoints[currentSnapPoint];
    const translateY = Math.max(0, dragOffset);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity duration-300"
                onClick={onClose}
                style={{ top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Bottom Sheet */}
            <div
                ref={sheetRef}
                className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl z-[9999] transition-all duration-300 ease-out"
                style={{
                    height: `${height}vh`,
                    transform: `translateY(${translateY}px)`,
                    transition: isDragging ? 'none' : 'all 0.3s ease-out',
                }}
            >
                {/* Drag Handle */}
                <div
                    className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                >
                    <div className="w-12 h-1.5 bg-muted rounded-full mb-3" />
                    {title && (
                        <div className="flex items-center justify-between w-full px-6">
                            <h2 className="text-lg font-bold">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 pb-6" style={{ height: 'calc(100% - 60px)' }}>
                    {children}
                </div>
            </div>
        </>
    );
};

export default BottomSheet;
