"use client";

import { useEffect, useState, use } from "react";
import { storage } from "@/lib/storage";
import { QuestionBank } from "@/types";
import { generateExamSession } from "@/lib/exam-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";

export default function BankDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadBank = async () => {
      const data = await storage.getQuestionBank(resolvedParams.id);
      if (data) {
        setBank(data);
      }
      setLoading(false);
    };
    loadBank();
  }, [resolvedParams.id]);

  const handleStartExam = async (templateId: string) => {
    if (!bank) return;
    try {
      setError(null);
      const session = generateExamSession(bank, templateId);
      await storage.saveExamSession(session);
      router.push(`/exam/${session.id}`);
    } catch (err: any) {
      setError(err.message || "Không thể sinh đề từ template này.");
    }
  };

  if (loading) return <div className="p-8 text-center mt-20 text-gray-500">Đang tải...</div>;
  if (!bank) return <div className="p-8 text-center mt-20 text-error">Không tìm thấy ngân hàng câu hỏi.</div>;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 -ml-4 text-gray-500 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>
      
      <div className="mb-10">
        <h1 className="text-3xl font-semibold mb-2 text-primary">{bank.metadata.subject}</h1>
        <p className="text-gray-500">Phiên bản: {bank.metadata.version} • {bank.questions.length} Câu hỏi</p>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      <h2 className="text-xl font-medium mb-4 text-gray-800">Các cấu trúc đề (Templates)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bank.examTemplates.map(template => (
          <Card key={template.id} className="border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg text-primary">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                {template.description || "Không có mô tả"}
              </p>
              <div className="flex justify-between items-center text-sm mb-6 bg-gray-50 p-3 rounded-md text-gray-700 border border-gray-100">
                <span>Số rules: <strong className="font-semibold">{template.rules.length}</strong></span>
                <span>{template.shuffleQuestions ? "Trộn câu" : "Theo thứ tự"}</span>
              </div>
              <Button className="w-full" onClick={() => handleStartExam(template.id)}>
                <Play className="mr-2 h-4 w-4" /> Bắt đầu làm bài
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
