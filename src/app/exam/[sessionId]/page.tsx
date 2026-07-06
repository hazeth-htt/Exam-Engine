"use client";

import { useEffect, useState, use, useMemo } from "react";
import { storage } from "@/lib/storage";
import { ExamSession } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

export default function ExamPlayer({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const data = await storage.getExamSession(resolvedParams.sessionId);
      if (data) {
        if (data.status === 'completed') {
          router.replace(`/result/${data.id}`);
          return;
        }
        setSession(data);
      }
      setLoading(false);
    };
    loadSession();
  }, [resolvedParams.sessionId, router]);

  const chapters = useMemo(() => {
    if (!session) return [];
    const chaps: { name: string, index: number }[] = [];
    const map = new Set<string>();
    session.questions.forEach((q, idx) => {
      if (q.chapter && !map.has(q.chapter)) {
        map.add(q.chapter);
        chaps.push({ name: q.chapter, index: idx });
      }
    });
    return chaps;
  }, [session]);

  const currentChapter = session?.questions[currentIndex]?.chapter || "";

  const handleSelectAnswer = async (answer: string) => {
    if (!session) return;
    const q = session.questions[currentIndex];
    const isMultiple = Array.isArray(q.answer);
    
    // Prevent changing if already checked
    const isChecked = !isMultiple ? session.userAnswers[q.id] !== undefined : checkedQuestions.has(q.id);
    if (isChecked) return;
    
    let currentAnswer = session.userAnswers[q.id];
    let newAnswer: string | string[];

    if (isMultiple) {
      const prevArray = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (prevArray.includes(answer)) {
        newAnswer = prevArray.filter(a => a !== answer);
      } else {
        newAnswer = [...prevArray, answer];
      }
    } else {
      newAnswer = answer;
    }

    const newSession = {
      ...session,
      userAnswers: {
        ...session.userAnswers,
        [q.id]: newAnswer
      }
    };
    setSession(newSession);
    await storage.saveExamSession(newSession);
  };

  const handleCheckAnswer = () => {
    if (!session) return;
    const q = session.questions[currentIndex];
    setCheckedQuestions(prev => new Set(prev).add(q.id));
  };

  const handleSubmit = async () => {
    if (!session) return;
    if (!confirm("Bạn có chắc chắn muốn nộp bài?")) return;
    
    const completedSession = { ...session, status: 'completed' as const, endTime: Date.now() };
    await storage.saveExamSession(completedSession);
    router.push(`/result/${session.id}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải dữ liệu thi...</div>;
  if (!session) return <div className="min-h-screen flex items-center justify-center text-error">Không tìm thấy phiên thi.</div>;

  const currentQuestion = session.questions[currentIndex];
  const currentAnswer = session.userAnswers[currentQuestion.id];
  const isMultiple = Array.isArray(currentQuestion.answer);
  const isChecked = !isMultiple ? (currentAnswer !== undefined) : checkedQuestions.has(currentQuestion.id);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-auto md:h-screen sticky top-0 z-10">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-primary mb-2">Danh sách câu hỏi</h2>
          {chapters.length > 0 && (
            <select
              className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm mb-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={currentChapter}
              onChange={(e) => {
                const chap = chapters.find(c => c.name === e.target.value);
                if (chap) setCurrentIndex(chap.index);
              }}
            >
              <option value="" disabled>Chọn chủ đề...</option>
              {chapters.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          )}
          <p className="text-sm text-gray-500">
            Tiến độ: {Object.keys(session.userAnswers).filter(k => session.userAnswers[k] && (Array.isArray(session.userAnswers[k]) ? (session.userAnswers[k] as string[]).length > 0 : true)).length} / {session.questions.length}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {session.questions.map((q, idx) => {
              const answered = session.userAnswers[q.id] && (Array.isArray(session.userAnswers[q.id]) ? (session.userAnswers[q.id] as string[]).length > 0 : true);
              const active = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "h-10 rounded text-sm font-medium border flex items-center justify-center transition-colors",
                    active ? "border-primary ring-2 ring-primary ring-offset-1" : "border-gray-200",
                    answered && !active ? "bg-primary text-white border-primary" : "",
                    !answered && !active ? "bg-white text-gray-700 hover:bg-gray-100" : "",
                    answered && active ? "bg-primary text-white" : ""
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <Button className="w-full" onClick={handleSubmit}>Nộp bài</Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-32 md:pb-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full mb-4">
                Câu hỏi {currentIndex + 1}
                {currentQuestion.difficulty && ` • Độ khó: ${currentQuestion.difficulty}`}
              </span>
              <h2 className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.question}
              </h2>
              {isMultiple && <p className="text-sm text-warning mt-2 font-medium">(Chọn nhiều đáp án)</p>}
            </div>

            <div className="space-y-3">
              {currentQuestion.choices?.map((choice, idx) => {
                const isSelected = isMultiple
                  ? Array.isArray(currentAnswer) && currentAnswer.includes(choice)
                  : currentAnswer === choice;

                const isCorrect = isMultiple
                  ? Array.isArray(currentQuestion.answer) && currentQuestion.answer.includes(choice)
                  : currentQuestion.answer === choice;

                let choiceStyle = "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
                
                if (isChecked) {
                  if (isCorrect) {
                    choiceStyle = "border-green-500 bg-green-50 ring-1 ring-green-500";
                  } else if (isSelected && !isCorrect) {
                    choiceStyle = "border-red-500 bg-red-50 ring-1 ring-red-500";
                  } else {
                    choiceStyle = "border-gray-200 opacity-60";
                  }
                } else if (isSelected) {
                  choiceStyle = "border-primary bg-primary/5 ring-1 ring-primary";
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectAnswer(choice)}
                    className={cn(
                      "p-4 border rounded-xl transition-all flex items-start gap-3",
                      isChecked ? "cursor-default" : "cursor-pointer",
                      choiceStyle
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isMultiple ? (
                        <div className={cn("w-5 h-5 border rounded flex items-center justify-center", 
                          isChecked && isCorrect ? "bg-green-500 border-green-500" : 
                          isChecked && isSelected && !isCorrect ? "bg-red-500 border-red-500" :
                          isSelected && !isChecked ? "bg-primary border-primary" : "border-gray-300"
                        )}>
                          {(isSelected || (isChecked && isCorrect)) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                      ) : (
                        <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", 
                          isChecked && isCorrect ? "border-green-500" :
                          isChecked && isSelected && !isCorrect ? "border-red-500" :
                          isSelected && !isChecked ? "border-primary" : "border-gray-300"
                        )}>
                          {(isSelected || (isChecked && isCorrect)) && (
                            <div className={cn("w-3 h-3 rounded-full",
                              isChecked && isCorrect ? "bg-green-500" :
                              isChecked && isSelected && !isCorrect ? "bg-red-500" :
                              "bg-primary"
                            )} />
                          )}
                        </div>
                      )}
                    </div>
                    <span className={cn("text-gray-800 leading-relaxed", 
                      isChecked && isCorrect && "font-semibold text-green-900",
                      isChecked && isSelected && !isCorrect && "text-red-900"
                    )}>{choice}</span>
                  </div>
                );
              })}
            </div>
            
            {isMultiple && !isChecked && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleCheckAnswer}
                  disabled={!currentAnswer || (currentAnswer as string[]).length === 0}
                >
                  Kiểm tra đáp án
                </Button>
              </div>
            )}
            
            {isChecked && currentQuestion.explanation && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-1">Giải thích:</h4>
                <p className="text-blue-800 text-sm">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-lg z-10 relative">
          <div className="max-w-3xl mx-auto flex justify-between">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => i - 1)}
            >
              Câu trước
            </Button>
            <Button
              disabled={currentIndex === session.questions.length - 1}
              onClick={() => setCurrentIndex(i => i + 1)}
            >
              Câu tiếp
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
