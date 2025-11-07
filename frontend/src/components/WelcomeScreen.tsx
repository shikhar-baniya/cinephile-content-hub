import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Film, BarChart3, Search, Smartphone, Sparkles } from 'lucide-react';
import FuturisticBackground from '@/components/FuturisticBackground';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const slides = [
    {
      icon: <Film className="w-16 h-16 text-primary animate-pulse" />,
      title: "Welcome to BingeBook",
      subtitle: "Your Personal Cinema Universe",
      content: "Track, organize, and discover your favorite movies and series all in one place. Let's get you started on your cinematic journey!",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <BarChart3 className="w-16 h-16 text-primary" />,
      title: "Powerful Features",
      subtitle: "Everything You Need",
      content: "• Track movies and series with detailed information\n• View analytics and insights about your viewing habits\n• Organize by genres, platforms, and watch status\n• Get personalized recommendations",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Search className="w-16 h-16 text-primary" />,
      title: "Easy to Use",
      subtitle: "Get Started in Seconds",
      content: "• Add movies with our simple form\n• Use filters to find exactly what you're looking for\n• Search through your entire collection instantly\n• Mark movies as watched, planning to watch, or currently watching",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Sparkles className="w-16 h-16 text-primary animate-bounce" />,
      title: "Ready to Begin?",
      subtitle: "Your Cinema Journey Awaits",
      content: "You're all set! Start building your personal movie and series collection. Add your first title and discover the joy of organized entertainment tracking.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const nextSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        handleComplete();
      }
      setIsAnimating(false);
    }, 150);
  };

  const prevSlide = () => {
    if (isAnimating || currentSlide === 0) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(currentSlide - 1);
      setIsAnimating(false);
    }, 150);
  };

  const handleComplete = () => {
    onComplete();
    navigate('/', { replace: true });
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isAnimating]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <FuturisticBackground />
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        <Card className="bg-black/40 backdrop-blur-md border-white/10">
          <CardContent className="p-8">
            {/* Progress Indicators */}
            <div className="flex justify-center space-x-2 mb-8">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-primary w-8' 
                      : index < currentSlide 
                        ? 'bg-primary/60' 
                        : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Slide Content */}
            <div className={`text-center space-y-6 min-h-[400px] flex flex-col justify-center transition-all duration-300 ${
              isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              <div className="flex justify-center">
                <div className={`p-4 rounded-full bg-gradient-to-r ${slides[currentSlide].gradient} bg-opacity-20`}>
                  {slides[currentSlide].icon}
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  {slides[currentSlide].title}
                </h1>
                <p className={`font-medium bg-gradient-to-r ${slides[currentSlide].gradient} bg-clip-text text-transparent`}>
                  {slides[currentSlide].subtitle}
                </p>
              </div>
              
              <div className="text-white/80 leading-relaxed whitespace-pre-line">
                {slides[currentSlide].content}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="ghost"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="text-white/60 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-white/60 hover:text-white"
              >
                Skip
              </Button>

              <Button
                onClick={nextSlide}
                className="bg-primary hover:bg-primary/90"
              >
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                {currentSlide < slides.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-1" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeScreen;