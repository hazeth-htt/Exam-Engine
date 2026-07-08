"use client";

import { useEffect, useState, use } from "react";
import { storage } from "@/lib/storage";
import { QuestionBank } from "@/types";
import { generateExamSession } from "@/lib/exam-generator";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Play, ChevronLeft } from "lucide-react";
import { QuestionManager } from "@/features/question-bank/components/QuestionManager";

export default function BankDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'practice' | 'manage'>('practice');
  const router = useRouter();

  useEffect(() => {
    storage.getQuestionBank(resolvedParams.id).then(data => {
      if (data) setBank(data);
      setLoading(false);
    });
  }, [resolvedParams.id]);

  const handleStartExam = async (templateId: string) => {
    if (!bank) return;
    try {
      const session = generateExamSession(bank, templateId);
      await storage.saveExamSession(session);
      router.push(`/exam/${session.id}`);
    } catch (e: any) {
      alert("Không thể tạo bài thi: " + e.message);
    }
  };

  if (loading) return <div className="p-8 text-sm text-muted">Đang tải thông tin...</div>;
  if (!bank) return <div className="p-8 text-sm text-muted">Không tìm thấy ngân hàng.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-accent hover:text-accent/80 text-[13px] font-medium mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-0.5" />
        Quay lại
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
          {bank.metadata.bankName || bank.metadata.subject}
        </h1>
        <p className="text-[13px] text-muted">v{bank.metadata.version} • {bank.questions.length} câu hỏi</p>
      </div>

      {/* Segmented Control Mac OS Style */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#e3e3e8] p-0.5 rounded-[8px] inline-flex shadow-inner">
          <button 
            className={`px-8 py-1 text-[13px] font-medium rounded-[6px] transition-all duration-200 ${activeTab === 'practice' ? 'bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'text-[#4d4d4d] hover:text-foreground'}`}
            onClick={() => setActiveTab('practice')}
          >
            Luyện tập
          </button>
          <button 
            className={`px-8 py-1 text-[13px] font-medium rounded-[6px] transition-all duration-200 ${activeTab === 'manage' ? 'bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'text-[#4d4d4d] hover:text-foreground'}`}
            onClick={() => setActiveTab('manage')}
          >
            Quản lý câu hỏi
          </button>
        </div>
      </div>

      {activeTab === 'practice' && (
        <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
          {bank.examTemplates.map(template => (
            <div 
              key={template.id} 
              onClick={() => handleStartExam(template.id)}
              className="flex justify-between items-center px-6 py-4 border-b border-[#e5e5ea] last:border-0 hover:bg-[#f4f5f5]/50 transition-colors group cursor-pointer"
            >
              <div>
                <h3 className="font-semibold text-[14px] text-foreground">{template.name}</h3>
                <p className="text-[13px] text-muted mt-0.5">{template.description || "Không có mô tả"}</p>
                <div className="flex items-center gap-3 mt-2 text-[12px] text-muted">
                  <span className="bg-black/5 px-2 py-0.5 rounded font-medium">{template.rules.reduce((acc, r) => acc + r.count, 0)} câu hỏi</span>
                </div>
              </div>
              <button 
                className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors"
                title="Bắt đầu ôn tập"
              >
                <Play className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          ))}
          {bank.examTemplates.length === 0 && (
            <div className="p-8 text-center text-[13px] text-muted">Không có template luyện tập nào.</div>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <QuestionManager bank={bank} onUpdate={setBank} />
      )}
    </div>
  );
}
