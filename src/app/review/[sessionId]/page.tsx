"use client";

import { useEffect, useState, use } from "react";
import { storage } from "@/lib/storage";
import { ExamSession } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function ReviewPlayer({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const data = await storage.getExamSession(resolvedParams.sessionId);
      if (data) {
        setSession(data);
      }
      setLoading(false);
    };
    loadSession();
  }, [resolvedParams.sessionId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>;
  if (!session) return <div className="min-h-screen flex items-center justify-center text-error">Không tìm thấy phiên thi.</div>;

  const currentQuestion = session.questions[currentIndex];
  const currentAnswer = session.userAnswers[currentQuestion.id];
  const isMultiple = Array.isArray(currentQuestion.answer);

  let isCorrect = false;
  if (isMultiple) {
    const userArr = Array.isArray(currentAnswer) ? currentAnswer : (currentAnswer ? [currentAnswer] : []);
    isCorrect = currentQuestion.answer.length === userArr.length && (currentQuestion.answer as string[]).every(a => userArr.includes(a));
  } else {
    isCorrect = currentAnswer === currentQuestion.answer;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-auto md:h-screen sticky top-0 z-10">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/result/${session.id}`)} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold text-lg text-primary">Xem lại bài</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {session.questions.map((q, idx) => {
              const uAns = session.userAnswers[q.id];
              let qCorrect = false;
              if (Array.isArray(q.answer)) {
                const uArr = Array.isArray(uAns) ? uAns : (uAns ? [uAns] : []);
                qCorrect = q.answer.length === uArr.length && (q.answer as string[]).every(a => uArr.includes(a));
              } else {
                qCorrect = uAns === q.answer;
              }
              const active = idx === currentIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "h-10 rounded text-sm font-medium border flex items-center justify-center transition-colors",
                    active ? "ring-2 ring-primary ring-offset-1" : "",
                    qCorrect ? "bg-success/10 text-success border-success/30" : (uAns !== undefined && uAns !== null ? "bg-error/10 text-error border-error/30" : "bg-gray-100 text-gray-500 border-gray-200")
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-32 md:pb-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                  Câu hỏi {currentIndex + 1}
                </span>
                {isCorrect ? (
                  <span className="inline-flex items-center text-xs font-semibold text-success bg-success/10 px-3 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 mr-1"/> Đúng</span>
                ) : (
                  <span className="inline-flex items-center text-xs font-semibold text-error bg-error/10 px-3 py-1 rounded-full"><XCircle className="w-3.5 h-3.5 mr-1"/> Sai</span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              {currentQuestion.choices?.map((choice, idx) => {
                const isUserSelected = isMultiple
                  ? Array.isArray(currentAnswer) && currentAnswer.includes(choice)
                  : currentAnswer === choice;
                
                const isTrueAnswer = isMultiple
                  ? (currentQuestion.answer as string[]).includes(choice)
                  : currentQuestion.answer === choice;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-4 border rounded-xl flex items-start gap-3 relative",
                      isTrueAnswer ? "border-success bg-success/5" : (isUserSelected ? "border-error bg-error/5" : "border-gray-200 opacity-70")
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isMultiple ? (
                        <div className={cn("w-5 h-5 border rounded flex items-center justify-center", isTrueAnswer ? "bg-success border-success" : (isUserSelected ? "bg-error border-error" : "border-gray-300"))}>
                          {(isTrueAnswer || isUserSelected) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                      ) : (
                        <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", isTrueAnswer ? "border-success" : (isUserSelected ? "border-error" : "border-gray-300"))}>
                          {(isTrueAnswer || isUserSelected) && <div className={cn("w-3 h-3 rounded-full", isTrueAnswer ? "bg-success" : "bg-error")} />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-gray-800 leading-relaxed">
                      {choice}
                    </div>
                  </div>
                );
              })}
            </div>

            {currentQuestion.explanation && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-8">
                <h4 className="font-semibold text-blue-900 mb-2">Giải thích:</h4>
                <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
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
