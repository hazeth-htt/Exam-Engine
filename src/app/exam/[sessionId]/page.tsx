"use client";

import { useEffect, useState, use, useMemo, useRef } from "react";
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
  
  // Ref to automatically scroll sidebar to active chapter
  const activeChapterRef = useRef<HTMLDivElement>(null);

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

  const chapterGroups = useMemo(() => {
    if (!session) return [];
    type ChapterGroup = { name: string, startIndex: number, endIndex: number, questions: { id: string, globalIndex: number }[] };
    const groups: ChapterGroup[] = [];
    
    let currentChapter = "";
    let currentGroup: ChapterGroup | null = null;

    for (let idx = 0; idx < session.questions.length; idx++) {
      const q = session.questions[idx];
      const ch = q.chapter || "Không có chủ đề";
      if (ch !== currentChapter) {
        if (currentGroup) {
          currentGroup.endIndex = idx - 1;
          groups.push(currentGroup);
        }
        currentChapter = ch;
        currentGroup = {
          name: ch,
          startIndex: idx,
          endIndex: idx,
          questions: []
        };
      }
      if (currentGroup) {
        currentGroup.questions.push({ id: q.id, globalIndex: idx });
      }
    }

    if (currentGroup) {
      currentGroup.endIndex = session.questions.length - 1;
      groups.push(currentGroup);
    }
    
    return groups;
  }, [session]);

  useEffect(() => {
    // Scroll active chapter into view slightly
    if (activeChapterRef.current) {
      activeChapterRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);

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
          <h2 className="font-semibold text-lg text-primary mb-1">Cấu trúc bài thi</h2>
          <p className="text-sm text-gray-500">
            Đã làm: <span className="font-semibold text-primary">{Object.keys(session.userAnswers).filter(k => session.userAnswers[k] && (Array.isArray(session.userAnswers[k]) ? (session.userAnswers[k] as string[]).length > 0 : true)).length}</span> / {session.questions.length}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {chapterGroups.map((group, gIdx) => {
            const isActiveChapter = currentIndex >= group.startIndex && currentIndex <= group.endIndex;
            return (
              <div 
                key={gIdx} 
                className="space-y-3"
                ref={isActiveChapter ? activeChapterRef : null}
              >
                <div 
                  className={cn(
                    "text-sm font-semibold px-2 py-1.5 rounded cursor-pointer transition-colors",
                    isActiveChapter ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setCurrentIndex(group.startIndex)}
                >
                  {group.name}
                </div>
                
                <div className="grid grid-cols-5 gap-2 px-2">
                  {group.questions.map((q, localIdx) => {
                    const globalIdx = q.globalIndex;
                    const answered = session.userAnswers[q.id] && (Array.isArray(session.userAnswers[q.id]) ? (session.userAnswers[q.id] as string[]).length > 0 : true);
                    const active = globalIdx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(globalIdx)}
                        className={cn(
                          "h-8 rounded text-xs font-medium border flex items-center justify-center transition-all",
                          active ? "border-primary ring-2 ring-primary ring-offset-1 scale-110 shadow-sm" : "border-gray-200 hover:border-gray-300",
                          answered && !active ? "bg-primary/90 text-white border-primary" : "",
                          !answered && !active ? "bg-white text-gray-600 hover:bg-gray-50" : "",
                          answered && active ? "bg-primary text-white" : ""
                        )}
                        title={`Câu ${globalIdx + 1}`}
                      >
                        {localIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button className="w-full shadow-sm" onClick={handleSubmit}>Nộp bài</Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  Câu hỏi {currentIndex + 1}
                  {currentQuestion.difficulty && <span className="ml-1 pl-1 border-l border-primary/20">• Độ khó: {currentQuestion.difficulty}</span>}
                </span>
                
                {currentQuestion.chapter && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    {currentQuestion.chapter}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-[22px] font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.question}
              </h2>
              {isMultiple && <p className="text-sm text-warning mt-3 font-medium bg-warning/10 inline-block px-2 py-1 rounded">(Chọn nhiều đáp án)</p>}
            </div>

            <div className="space-y-3">
              {currentQuestion.choices?.map((choice, idx) => {
                const isSelected = isMultiple
                  ? Array.isArray(currentAnswer) && currentAnswer.includes(choice)
                  : currentAnswer === choice;

                const isCorrect = isMultiple
                  ? Array.isArray(currentQuestion.answer) && currentQuestion.answer.includes(choice)
                  : currentQuestion.answer === choice;

                let choiceStyle = "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80 shadow-sm";
                
                if (isChecked) {
                  if (isCorrect) {
                    choiceStyle = "border-green-500 bg-green-50 ring-1 ring-green-500 shadow-sm";
                  } else if (isSelected && !isCorrect) {
                    choiceStyle = "border-red-500 bg-red-50 ring-1 ring-red-500 shadow-sm";
                  } else {
                    choiceStyle = "border-gray-200 opacity-60 bg-white";
                  }
                } else if (isSelected) {
                  choiceStyle = "border-primary bg-primary/5 ring-1 ring-primary shadow-sm";
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectAnswer(choice)}
                    className={cn(
                      "p-4 border rounded-xl transition-all flex items-start gap-4 group",
                      isChecked ? "cursor-default" : "cursor-pointer",
                      choiceStyle
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isMultiple ? (
                        <div className={cn("w-5 h-5 border rounded flex items-center justify-center transition-colors", 
                          isChecked && isCorrect ? "bg-green-500 border-green-500" : 
                          isChecked && isSelected && !isCorrect ? "bg-red-500 border-red-500" :
                          isSelected && !isChecked ? "bg-primary border-primary" : "border-gray-300 group-hover:border-gray-400"
                        )}>
                          {(isSelected || (isChecked && isCorrect)) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                      ) : (
                        <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", 
                          isChecked && isCorrect ? "border-green-500" :
                          isChecked && isSelected && !isCorrect ? "border-red-500" :
                          isSelected && !isChecked ? "border-primary" : "border-gray-300 group-hover:border-gray-400"
                        )}>
                          {(isSelected || (isChecked && isCorrect)) && (
                            <div className={cn("w-2.5 h-2.5 rounded-full",
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
                  className="shadow-md"
                >
                  Kiểm tra đáp án
                </Button>
              </div>
            )}
            
            {isChecked && currentQuestion.explanation && (
              <div className="mt-8 p-5 bg-blue-50/80 border border-blue-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-blue-700 font-bold text-sm">i</span>
                  <h4 className="font-semibold text-blue-900">Giải thích chi tiết</h4>
                </div>
                <p className="text-blue-800 text-sm leading-relaxed ml-8">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 relative">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => i - 1)}
              className="w-32"
            >
              ← Câu trước
            </Button>
            
            <div className="text-sm font-medium text-gray-500">
              {currentIndex + 1} / {session.questions.length}
            </div>
            
            <Button
              disabled={currentIndex === session.questions.length - 1}
              onClick={() => setCurrentIndex(i => i + 1)}
              className="w-32"
            >
              Câu tiếp →
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
