import React from "react";
import { Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";

interface Props {
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  page: number;
  itemsPerPage: number;
}

export const QuestionList = React.memo(function QuestionList({ questions, onEdit, onDelete, loading, page, itemsPerPage }: Props) {
  if (questions.length === 0) {
    return <p className="text-center text-[13px] text-muted py-12">Chưa có câu hỏi nào.</p>;
  }

  return (
    <div className="space-y-0">
      {questions.map((q, idx) => (
        <div key={q.id} className="py-4 border-b border-black/5 bg-transparent hover:bg-black/[0.02] transition-colors flex gap-4 items-start group px-2">
          <div className="text-muted w-6 flex justify-end font-medium text-[13px] pt-0.5 shrink-0">
            {(page - 1) * itemsPerPage + idx + 1}.
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
            <Button variant="ghost" size="icon" className="text-muted hover:text-accent hover:bg-accent/10 h-7 w-7" onClick={() => onEdit(q)} disabled={loading}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted hover:text-error hover:bg-error/10 h-7 w-7" onClick={() => onDelete(q.id)} disabled={loading}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
});
