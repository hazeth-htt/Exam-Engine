"use client";

import { useEffect, useState, use } from "react";
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
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const data = await storage.getExamSession(resolvedParams.sessionId);
      if (data) {
        // Nếu đã hoàn thành thì đá về result
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

  const handleSelectAnswer = async (answer: string) => {
    if (!session) return;
    const q = session.questions[currentIndex];
    
    let currentAnswer = session.userAnswers[q.id];
    let newAnswer: string | string[];

    if (Array.isArray(q.answer)) {
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

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-auto md:h-screen sticky top-0 z-10">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-primary">Danh sách câu hỏi</h2>
          <p className="text-sm text-gray-500 mt-1">
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

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectAnswer(choice)}
                    className={cn(
                      "p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-3",
                      isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isMultiple ? (
                        <div className={cn("w-5 h-5 border rounded flex items-center justify-center", isSelected ? "bg-primary border-primary" : "border-gray-300")}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                      ) : (
                        <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", isSelected ? "border-primary" : "border-gray-300")}>
                          {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-800 leading-relaxed">{choice}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-lg">
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
