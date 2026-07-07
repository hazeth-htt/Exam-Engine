"use client";

import { useEffect, useState, use } from "react";
import { storage } from "@/lib/storage";
import { FlashcardDeck, Flashcard } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

type QuizQuestion = {
  card: Flashcard;
  options: string[];
};

export default function FlashcardQuiz({ params }: { params: Promise<{ deckId: string }> }) {
  const resolvedParams = use(params);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const router = useRouter();

  const generateQuiz = (deckData: FlashcardDeck) => {
    // Shuffle cards
    const shuffledCards = [...deckData.cards].sort(() => Math.random() - 0.5);
    const allMeanings = deckData.cards.map(c => c.back.meaning);

    const generatedQuestions = shuffledCards.map(card => {
      // Pick 3 wrong options
      const wrongOptions = allMeanings
        .filter(m => m !== card.back.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [card.back.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
      
      return { card, options };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
  };

  useEffect(() => {
    const loadDeck = async () => {
      const data = await storage.getFlashcardDeck(resolvedParams.deckId);
      if (data) {
        setDeck(data);
        generateQuiz(data);
      }
    };
    loadDeck();
  }, [resolvedParams.deckId]);

  const handleSelect = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    setSelectedAnswer(option);
    
    if (option === questions[currentIndex].card.back.meaning) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  if (!deck || questions.length === 0) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  if (isFinished) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoàn thành!</h2>
          <p className="text-gray-600 mb-8">Bạn đã làm bài kiểm tra bộ từ vựng: {deck.metadata.title}</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <div className="text-5xl font-bold text-green-600 mb-2">{score}/{questions.length}</div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Điểm số</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => router.push('/flashcards')}>Quay lại</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => generateQuiz(deck)}>Làm lại</Button>
          </div>
        </div>
      </main>
    );
  }

  const currentQ = questions[currentIndex];
  const correctAnswer = currentQ.card.back.meaning;

  return (
    <main className="min-h-screen bg-gray-50/50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/flashcards')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Trắc nghiệm: {deck.metadata.title}</h1>
            <p className="text-xs text-gray-500">
              Câu {currentIndex + 1} / {questions.length}
            </p>
          </div>
        </div>
        <div className="text-sm font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full">
          Điểm: {score}
        </div>
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto p-6 flex flex-col pt-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center mb-8">
          <span className="text-sm font-medium text-green-600 mb-4 inline-block bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">Từ vựng</span>
          {currentQ.card.front.hiragana && (
            <p className="text-xl text-gray-500 mb-2">{currentQ.card.front.hiragana}</p>
          )}
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900">
            {currentQ.card.front.kanji}
          </h2>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === correctAnswer;
            const showCorrect = selectedAnswer !== null && isCorrect;
            const showWrong = isSelected && !isCorrect;

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex justify-between items-center",
                  selectedAnswer === null ? "bg-white border-gray-100 hover:border-green-500 hover:bg-green-50" : "",
                  showCorrect ? "bg-green-50 border-green-500 text-green-800" : "",
                  showWrong ? "bg-red-50 border-red-500 text-red-800" : "",
                  selectedAnswer !== null && !showCorrect && !showWrong ? "bg-gray-50 border-gray-100 opacity-50" : ""
                )}
              >
                <span className="text-lg font-medium">{option}</span>
                {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                {showWrong && <XCircle className="w-6 h-6 text-red-600" />}
              </button>
            );
          })}
        </div>

        {selectedAnswer !== null && (
          <div className="mt-8 flex justify-end">
            <Button 
              size="lg" 
              onClick={handleNext}
              className="bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto px-8 rounded-full"
            >
              {currentIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
