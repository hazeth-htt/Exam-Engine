"use client";

import { useState, useEffect, useRef } from "react";
import { Question } from "@/types";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal-provider";

interface Props {
  initialData: Question | null;
  onSave: (q: Question) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function QuestionForm({ initialData, onSave, onCancel, loading }: Props) {
  const { showAlert } = useModal();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [choicesText, setChoicesText] = useState("");
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.question);
      setImageUrl(initialData.imageUrl || "");
      setChoicesText(initialData.choices ? initialData.choices.join("\n") : "");
      setAnswer(Array.isArray(initialData.answer) ? initialData.answer.join(", ") : initialData.answer);
      setExplanation(initialData.explanation || "");
      // Scroll to form smoothly
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    } else {
      setQuestionText("");
      setImageUrl("");
      setChoicesText("");
      setAnswer("");
      setExplanation("");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return await showAlert("Vui lòng nhập câu hỏi");
    if (!answer.trim()) return await showAlert("Vui lòng nhập đáp án");

    const choices = choicesText.split("\n").map(s => s.trim()).filter(Boolean);
    
    const newQ: Question = {
      id: initialData?.id || `q_${Date.now()}`,
      type: "multiple-choice",
      difficulty: "Dễ",
      question: questionText.trim(),
      imageUrl: imageUrl.trim() || undefined,
      choices: choices.length > 0 ? choices : undefined,
      answer: answer.trim(),
      explanation: explanation.trim() || undefined
    };

    await onSave(newQ);
  };

  return (
    <div ref={formRef} className="bg-[#f4f5f5]/50 border border-black/5 rounded-xl p-5 shadow-sm scroll-mt-24">
      <h4 className="font-medium text-[14px] mb-4 text-foreground">{initialData ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium mb-1.5 text-foreground">Câu hỏi *</label>
          <textarea 
            required
            className="w-full p-2 bg-white border border-[#d1d1d6] rounded-[6px] text-[13px] focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)_inset]" 
            rows={3} 
            value={questionText} 
            onChange={e => setQuestionText(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium mb-1.5 text-foreground">Link Ảnh (tuỳ chọn)</label>
          <input 
            type="text" 
            className="w-full p-2 bg-white border border-[#d1d1d6] rounded-[6px] text-[13px] focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)_inset]" 
            placeholder="/images/example.png hoặc https://..."
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium mb-1.5 text-foreground">Các đáp án (Mỗi đáp án 1 dòng, tuỳ chọn nếu là câu tự luận)</label>
          <textarea 
            className="w-full p-2 bg-white border border-[#d1d1d6] rounded-[6px] text-[13px] focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)_inset]" 
            rows={4} 
            value={choicesText} 
            onChange={e => setChoicesText(e.target.value)} 
            placeholder="Đáp án A&#10;Đáp án B&#10;Đáp án C"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium mb-1.5 text-foreground">Đáp án đúng *</label>
          <input 
            type="text" 
            required
            className="w-full p-2 bg-white border border-[#d1d1d6] rounded-[6px] text-[13px] focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)_inset]" 
            value={answer} 
            onChange={e => setAnswer(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium mb-1.5 text-foreground">Giải thích (tuỳ chọn)</label>
          <textarea 
            className="w-full p-2 bg-white border border-[#d1d1d6] rounded-[6px] text-[13px] focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/30 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)_inset]" 
            rows={2} 
            value={explanation} 
            onChange={e => setExplanation(e.target.value)} 
          />
        </div>
        <div className="pt-2 flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-8 text-[13px]">
            Hủy
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 h-8 text-[13px]">
            {loading ? "Đang lưu..." : "Lưu câu hỏi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
