"use client";

import { useEffect, useState, use } from "react";
import { storage } from "@/lib/storage";
import { ExamSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export default function ResultView({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const [session, setSession] = useState<ExamSession | null>(null);
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

  if (loading) return <div className="p-8 text-center mt-20 text-gray-500">Đang tính điểm...</div>;
  if (!session) return <div className="p-8 text-center text-error mt-20">Không tìm thấy phiên thi.</div>;

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  session.questions.forEach(q => {
    const userAnswer = session.userAnswers[q.id];
    if (userAnswer === undefined || userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
      unattemptedCount++;
      return;
    }

    if (Array.isArray(q.answer)) {
      const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const isCorrect = q.answer.length === userArr.length && (q.answer as string[]).every(a => userArr.includes(a));
      if (isCorrect) correctCount++;
      else wrongCount++;
    } else {
      if (userAnswer === q.answer) correctCount++;
      else wrongCount++;
    }
  });

  const total = session.questions.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col justify-center">
      <Card className="text-center shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-primary">Kết quả bài thi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="relative inline-flex items-center justify-center mt-4">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-primary" strokeDasharray="440" strokeDashoffset={440 - (440 * score) / 100} strokeLinecap="round" />
            </svg>
            <span className="absolute text-4xl font-semibold text-primary">{score}%</span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-success/10 p-4 rounded-xl border border-success/20">
              <CheckCircle className="mx-auto h-6 w-6 text-success mb-2" />
              <p className="text-2xl font-bold text-success">{correctCount}</p>
              <p className="text-xs text-success font-medium uppercase mt-1">Đúng</p>
            </div>
            <div className="bg-error/10 p-4 rounded-xl border border-error/20">
              <XCircle className="mx-auto h-6 w-6 text-error mb-2" />
              <p className="text-2xl font-bold text-error">{wrongCount}</p>
              <p className="text-xs text-error font-medium uppercase mt-1">Sai</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
              <div className="mx-auto h-6 w-6 text-gray-500 mb-2 flex items-center justify-center font-bold text-lg">-</div>
              <p className="text-2xl font-bold text-gray-600">{unattemptedCount}</p>
              <p className="text-xs text-gray-500 font-medium uppercase mt-1">Chưa làm</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" onClick={() => router.push(`/review/${session.id}`)}>
              Xem lại đáp án
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.replace(`/bank/${session.bankId}`)}>
              Trở về Ngân hàng
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
