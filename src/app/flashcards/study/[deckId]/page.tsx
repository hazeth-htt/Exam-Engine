"use client";

import { useEffect, useState, use } from "react";
import { storage } from "@/lib/storage";
import { FlashcardDeck } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shuffle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/utils/cn";

export default function FlashcardStudy({ params }: { params: Promise<{ deckId: string }> }) {
  const resolvedParams = use(params);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadDeck = async () => {
      const data = await storage.getFlashcardDeck(resolvedParams.deckId);
      if (data) setDeck(data);
      setLoading(false);
    };
    loadDeck();
  }, [resolvedParams.deckId]);

  const handleNext = () => {
    if (!deck) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i < deck.cards.length - 1 ? i + 1 : i));
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i > 0 ? i - 1 : i));
    }, 150);
  };

  const handleShuffle = () => {
    if (!deck) return;
    const shuffledCards = [...deck.cards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    setDeck({ ...deck, cards: shuffledCards });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải thẻ...</div>;
  if (!deck || deck.cards.length === 0) return <div className="min-h-screen flex items-center justify-center text-error">Không tìm thấy bộ từ vựng.</div>;

  const currentCard = deck.cards[currentIndex];

  return (
    <main className="min-h-screen bg-gray-50/50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/flashcards')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{deck.metadata.title}</h1>
            <p className="text-xs text-gray-500">
              Thẻ {currentIndex + 1} / {deck.cards.length}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleShuffle} className="gap-2">
          <Shuffle className="w-4 h-4" />
          Trộn thẻ
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
        <div className="w-full max-w-2xl aspect-[3/2] perspective-[1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={cn(
            "relative w-full h-full transition-transform duration-500 transform-style-3d shadow-xl rounded-3xl",
            isFlipped ? "rotate-y-180" : ""
          )}>
            
            {/* Front of card */}
            <div className="absolute w-full h-full backface-hidden bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center p-8 text-center">
              <span className="text-sm font-medium text-green-600 mb-6 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">Tiếng Nhật</span>
              {currentCard.front.hiragana && (
                <p className="text-xl md:text-2xl text-gray-500 mb-2">{currentCard.front.hiragana}</p>
              )}
              <h2 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                {currentCard.front.kanji}
              </h2>
              <div className="absolute bottom-6 text-gray-300 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Chạm để lật
              </div>
            </div>

            {/* Back of card */}
            <div className="absolute w-full h-full backface-hidden bg-green-500 border border-green-600 rounded-3xl flex flex-col items-center justify-center p-8 text-center rotate-y-180">
              <span className="text-sm font-medium text-green-100 mb-6 bg-green-600 px-3 py-1 rounded-full uppercase tracking-wider">Tiếng Việt</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {currentCard.back.meaning}
              </h2>
            </div>
            
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 flex justify-center gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="w-32 gap-2"
        >
          <ChevronLeft className="w-5 h-5" /> Trước
        </Button>
        <Button 
          size="lg" 
          onClick={handleNext} 
          disabled={currentIndex === deck.cards.length - 1}
          className="w-32 gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          Sau <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </main>
  );
}
