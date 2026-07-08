import { useState, useCallback } from "react";
import { Question, QuestionBank } from "@/types";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { useModal } from "@/components/ui/modal-provider";
import { QuestionForm } from "./QuestionForm";
import { QuestionList } from "./QuestionList";

interface Props {
  bank: QuestionBank;
  onUpdate: (bank: QuestionBank) => void;
}

export function QuestionManager({ bank, onUpdate }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const { showConfirm, showAlert } = useModal();
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(bank.questions.length / itemsPerPage);
  const displayedQuestions = bank.questions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const saveBank = async (updatedBank: QuestionBank) => {
    setLoading(true);
    try {
      await storage.saveQuestionBank(updatedBank);
      onUpdate(updatedBank);

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

  const handleDelete = useCallback(async (qId: string) => {
    if (!(await showConfirm("Xoá câu hỏi này?"))) return;
    const updated = { ...bank, questions: bank.questions.filter(q => q.id !== qId) };
    await saveBank(updated);
  }, [bank, showConfirm]);

  const handleEdit = useCallback((q: Question) => {
    setEditingQuestion(q);
    setIsAdding(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingQuestion(null);
    setIsAdding(false);
  }, []);

  const handleSaveQuestion = useCallback(async (newQ: Question) => {
    let updatedQuestions;
    if (editingQuestion) {
      updatedQuestions = bank.questions.map(q => q.id === editingQuestion.id ? newQ : q);
    } else {
      updatedQuestions = [...bank.questions, newQ];
    }
    const updated = { ...bank, questions: updatedQuestions };
    await saveBank(updated);
    handleCancelEdit();
  }, [bank, editingQuestion, saveBank, handleCancelEdit]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Danh sách câu hỏi ({bank.questions.length})</h3>
        <Button onClick={() => isAdding ? handleCancelEdit() : setIsAdding(true)} variant={isAdding ? "outline" : "default"}>
          {isAdding ? "Hủy" : "+ Thêm câu hỏi"}
        </Button>
      </div>

      {isAdding && (
        <QuestionForm 
          initialData={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={handleCancelEdit}
          loading={loading}
        />
      )}

      <div className="border-t border-black/5 mt-4">
        <QuestionList 
          questions={displayedQuestions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          page={page}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 text-[13px]"
          >
            Trang trước
          </Button>
          <span className="text-[13px] text-muted-foreground px-2">
            Trang {page} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 text-[13px]"
          >
            Trang tiếp
          </Button>
        </div>
      )}
    </div>
  );
}
