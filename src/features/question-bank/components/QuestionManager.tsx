import { useState } from "react";
import { Question, QuestionBank } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { useModal } from "@/components/ui/modal-provider";

interface Props {
  bank: QuestionBank;
  onUpdate: (bank: QuestionBank) => void;
}

export function QuestionManager({ bank, onUpdate }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showConfirm, showAlert } = useModal();
  
  // Form states
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [choicesText, setChoicesText] = useState("");
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  const saveBank = async (updatedBank: QuestionBank) => {
    setLoading(true);
    try {
      // Always save to IndexedDB first
      await storage.saveQuestionBank(updatedBank);
      onUpdate(updatedBank);

      // Attempt to sync to server if it's a default bank, but ignore errors (Vercel read-only FS)
      if (updatedBank.id.startsWith('default-')) {
        fetch(`/api/banks/${updatedBank.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedBank)
        }).catch(e => console.log('Server update failed, ignored'));
      }
    } catch (e) {
      console.error(e);
      await showAlert("Đã xảy ra lỗi khi lưu vào bộ nhớ cục bộ.");
    }
    setLoading(false);
  };

  const handleDelete = async (qId: string) => {
    if (!(await showConfirm("Xoá câu hỏi này?"))) return;
    const updated = { ...bank, questions: bank.questions.filter(q => q.id !== qId) };
    await saveBank(updated);
  };

  const handleEdit = (q: Question) => {
    setEditingQId(q.id);
    setQuestionText(q.question);
    setImageUrl(q.imageUrl || "");
    setChoicesText(q.choices ? q.choices.join("\n") : "");
    setAnswer(Array.isArray(q.answer) ? q.answer.join(", ") : q.answer);
    setExplanation(q.explanation || "");
    setIsAdding(true);
  };

  const handleCancelEdit = () => {
    setEditingQId(null);
    setQuestionText("");
    setImageUrl("");
    setChoicesText("");
    setAnswer("");
    setExplanation("");
    setIsAdding(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return await showAlert("Vui lòng nhập câu hỏi");
    if (!answer.trim()) return await showAlert("Vui lòng nhập đáp án");

    const choices = choicesText.split("\n").map(s => s.trim()).filter(Boolean);
    
    const newQ: Question = {
      id: editingQId || `q_${Date.now()}`,
      type: "multiple-choice",
      difficulty: "Dễ",
      question: questionText.trim(),
      imageUrl: imageUrl.trim() || undefined,
      choices: choices.length > 0 ? choices : undefined,
      answer: answer.trim(),
      explanation: explanation.trim() || undefined
    };

    let updatedQuestions;
    if (editingQId) {
      updatedQuestions = bank.questions.map(q => q.id === editingQId ? newQ : q);
    } else {
      updatedQuestions = [...bank.questions, newQ];
    }

    const updated = { ...bank, questions: updatedQuestions };
    await saveBank(updated);
    
    handleCancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Danh sách câu hỏi ({bank.questions.length})</h3>
        <Button onClick={() => isAdding ? handleCancelEdit() : setIsAdding(true)} variant={isAdding ? "outline" : "default"}>
          {isAdding ? "Hủy" : "+ Thêm câu hỏi"}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-[#f4f5f5]/50 border border-black/5 rounded-xl p-5 shadow-sm">
          <h4 className="font-medium text-[14px] mb-4 text-foreground">{editingQId ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</h4>
          <form onSubmit={handleAdd} className="space-y-4">
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
            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full h-8 text-[13px]">
                {loading ? "Đang lưu..." : "Lưu câu hỏi"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-0 border-t border-black/5 mt-4">
        {bank.questions.map((q, idx) => (
          <div key={q.id} className="py-4 border-b border-black/5 bg-transparent hover:bg-black/[0.02] transition-colors flex gap-4 items-start group px-2">
            <div className="text-muted w-6 flex justify-end font-medium text-[13px] pt-0.5 shrink-0">
              {idx + 1}.
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium whitespace-pre-wrap text-[13px] text-foreground leading-relaxed">{q.question}</p>
              {q.imageUrl && <img src={q.imageUrl} alt="img" className="h-24 object-contain mt-3 border border-black/10 rounded-[6px] bg-white shadow-sm" />}
              {q.choices && q.choices.length > 0 && (
                <div className="mt-3 text-[13px] text-muted grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {q.choices.map((c, i) => (
                    <div key={i} className={`px-2 py-1 rounded-[4px] ${c === q.answer ? "bg-accent/10 text-accent font-medium" : "hover:bg-black/5"}`}>
                      {String.fromCharCode(65 + i)}. {c}
                    </div>
                  ))}
                </div>
              )}
              {(!q.choices || q.choices.length === 0) && (
                <div className="mt-2 text-[13px] bg-black/5 px-3 py-2 rounded-[6px] inline-block border border-black/5">
                  <span className="font-medium text-muted">Đáp án:</span> <span className="text-foreground ml-1">{Array.isArray(q.answer) ? q.answer.join(", ") : q.answer}</span>
                </div>
              )}
            </div>
            <div className="flex opacity-0 group-hover:opacity-100 transition-all">
              <Button variant="ghost" size="icon" className="text-muted hover:text-accent hover:bg-accent/10 h-7 w-7" onClick={() => handleEdit(q)} disabled={loading}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted hover:text-error hover:bg-error/10 h-7 w-7" onClick={() => handleDelete(q.id)} disabled={loading}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {bank.questions.length === 0 && <p className="text-center text-[13px] text-muted py-12">Chưa có câu hỏi nào.</p>}
      </div>
    </div>
  );
}
