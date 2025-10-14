import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Story {
    id: string;
    title: string;
    content: React.ReactNode;
}

interface StoryModeProps {
    isOpen: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex?: number;
}

const StoryMode = ({ isOpen, onClose, stories, initialIndex = 0 }: StoryModeProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        };
    }, [isOpen, initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    const goToNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 75) {
            // Swiped left
            goToNext();
        }

        if (touchStart - touchEnd < -75) {
            // Swiped right
            goToPrevious();
        }
    };

    const handleTapNavigation = (e: React.MouseEvent<HTMLDivElement>) => {
        const clickX = e.clientX;
        const screenWidth = window.innerWidth;

        if (clickX < screenWidth / 3) {
            goToPrevious();
        } else if (clickX > (screenWidth * 2) / 3) {
            goToNext();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed bg-black flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                minHeight: '100vh',
                maxHeight: '100vh',
                zIndex: 10000,
                position: 'fixed'
            }}
        >
            {/* Progress bars */}
            <div className="flex gap-1 p-4 pb-2 flex-shrink-0">
                {stories.map((story, index) => (
                    <div
                        key={story.id}
                        className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"
                    >
                        <div
                            className={`h-full bg-white rounded-full transition-all duration-300 ${index < currentIndex ? 'w-full' :
                                index === currentIndex ? 'w-full animate-progress' :
                                    'w-0'
                                }`}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
                <h2 className="text-white font-semibold text-lg">
                    {stories[currentIndex].title}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="h-6 w-6 text-white" />
                </button>
            </div>

            {/* Content */}
            <div
                className="flex-1 overflow-y-auto px-4 pb-safe"
                onClick={handleTapNavigation}
                style={{
                    maxHeight: 'calc(100vh - 120px)',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
                    {stories[currentIndex].content}
                </div>
            </div>

            {/* Navigation arrows (desktop) */}
            <div className="hidden md:flex absolute inset-y-0 left-0 right-0 pointer-events-none">
                {currentIndex > 0 && (
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors pointer-events-auto"
                    >
                        <ChevronLeft className="h-6 w-6 text-white" />
                    </button>
                )}
                {currentIndex < stories.length - 1 && (
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors pointer-events-auto"
                    >
                        <ChevronRight className="h-6 w-6 text-white" />
                    </button>
                )}
            </div>

            {/* Bottom navigation hint */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                {stories.map((story, index) => (
                    <div
                        key={story.id}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                            ? 'bg-white w-6'
                            : 'bg-white/40'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default StoryMode;
