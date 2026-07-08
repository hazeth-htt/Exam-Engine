"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { storage } from "@/lib/storage";
import { QuestionBank } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MacOSFolderIcon } from "@/components/icons/MacOSFolderIcon";

function ExamsPageInner() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSubject = searchParams.get('subject');

  const loadBanks = async () => {
    setLoading(true);
    const data = await storage.getQuestionBanks();
    setBanks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBanks();
  }, [currentSubject]);

  const filteredBanks = useMemo(() => {
    if (!currentSubject) return banks;
    return banks.filter(b => b.metadata.subject === currentSubject);
  }, [banks, currentSubject]);

  const subjects = useMemo(() => {
    return Array.from(new Set(banks.map(b => b.metadata.subject).filter(Boolean)));
  }, [banks]);

  const handleCreateBank = async () => {
    if (!currentSubject) return;
    const bankName = window.prompt("Nhập tên cho Ngân hàng mới:");
    if (!bankName) return;

    try {
      const res = await fetch('/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: currentSubject, bankName })
      });
      if (res.ok) {
        const result = await res.json();
        const fetchNew = await fetch('/api/banks');
        const defaultBanks = await fetchNew.json();
        const newBank = defaultBanks.find((b: any) => b.id === result.id);
        if (newBank) {
          await storage.saveQuestionBank(newBank);
        }
        await loadBanks();
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error}`);
      }
    } catch(e) {
      console.error(e);
      alert("Đã xảy ra lỗi khi tạo ngân hàng.");
    }
  };

  const handleDeleteBank = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa ngân hàng này không? Dữ liệu không thể khôi phục.")) {
      try {
        const res = await fetch(`/api/banks/${id}`, { method: 'DELETE' });
        if (res.ok) {
          await storage.deleteQuestionBank(id);
          await loadBanks();
        } else {
          alert("Xóa thất bại");
        }
      } catch(e) {
        console.error(e);
      }
    }
  };

  const handleDeleteSubject = async () => {
    if (!currentSubject) return;
    if (confirm(`Bạn có chắc chắn muốn xóa toàn bộ môn học "${currentSubject}" cùng các ngân hàng bên trong?`)) {
      try {
        for (const bank of filteredBanks) {
          await fetch(`/api/banks/${bank.id}`, { method: 'DELETE' });
          await storage.deleteQuestionBank(bank.id);
        }
        router.replace('/exams');
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) {
    return <div className="text-muted text-sm mt-10">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {!currentSubject && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Trang chủ</h1>
          </div>
          
          {subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-xl border border-dashed border-border shadow-sm">
              <div className="flex items-center justify-center mb-4">
                <MacOSFolderIcon className="w-[80px] h-[64px] opacity-70 grayscale-[30%]" />
              </div>
              <h3 className="text-foreground font-medium mb-1">Chưa có dữ liệu</h3>
              <p className="text-muted text-sm mb-6">Bạn chưa có môn học nào, hãy bấm nút "Thêm Môn học mới" ở thanh bên.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8">
              {subjects.map(sub => (
                <div key={sub} onClick={() => router.push(`/exams?subject=${encodeURIComponent(sub)}`)} className="group flex flex-col items-center p-2 rounded-lg hover:bg-black/5 transition-all cursor-pointer relative">
                  <div className="flex items-center justify-center mb-2">
                    <MacOSFolderIcon className="w-[80px] h-[64px] drop-shadow-sm group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="bg-transparent px-1.5 py-0.5 rounded text-center w-full">
                    <h3 className="font-medium text-[12px] truncate leading-tight text-foreground" title={sub}>{sub}</h3>
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">{banks.filter(b => b.metadata.subject === sub).length} ngân hàng</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentSubject && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{currentSubject}</h1>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleDeleteSubject} 
                variant="ghost" 
                className="text-muted border border-transparent hover:border-error hover:text-error hover:bg-error/5 h-8 px-3 text-xs font-medium transition-colors"
              >
                Xóa môn học
              </Button>
              <Button onClick={handleCreateBank} className="bg-accent text-white hover:bg-accent/90 shadow-sm rounded-md h-8 px-3 text-xs font-medium border border-black/5">
                <Plus className="w-3.5 h-3.5 mr-1" /> Ngân hàng mới
              </Button>
            </div>
          </div>

          {filteredBanks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-xl border border-dashed border-border shadow-sm">
              <div className="flex items-center justify-center mb-4">
                <MacOSFolderIcon className="w-[100px] h-[80px] opacity-70 grayscale-[30%]" />
              </div>
              <h3 className="text-foreground font-medium mb-1">Chưa có ngân hàng nào</h3>
              <p className="text-muted text-sm mb-6">Môn học này hiện đang trống.</p>
              <Button variant="outline" className="rounded-md h-8 px-4 text-xs font-medium" onClick={handleCreateBank}>Tạo ngân hàng</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
              {filteredBanks.map((bank) => (
                <div 
                  key={bank.id}
                  onClick={() => router.push(`/bank/${bank.id}`)}
                  className="group flex flex-col items-center p-3 rounded-xl hover:bg-black/5 transition-all cursor-pointer relative"
                >
                  <button 
                    onClick={(e) => handleDeleteBank(e, bank.id)} 
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-white border border-black/10 rounded-full w-6 h-6 flex items-center justify-center text-muted hover:text-error hover:bg-error/10 shadow-sm transition-all z-10"
                    title="Xóa ngân hàng"
                  >
                    <span className="text-[12px] font-bold">×</span>
                  </button>
                  <div className="flex items-center justify-center mb-3">
                    <MacOSFolderIcon className="w-[110px] h-[88px] drop-shadow-sm group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="bg-transparent px-2 py-0.5 rounded text-center w-full">
                    <h3 className="font-medium text-[13px] text-foreground truncate leading-tight" title={bank.metadata.bankName || bank.metadata.subject}>
                      {bank.metadata.bankName || bank.metadata.subject}
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">{bank.questions.length} mục</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExamsPage() {
  return (
    <Suspense fallback={<div className="text-muted text-sm mt-10">Đang tải...</div>}>
      <ExamsPageInner />
    </Suspense>
  );
}

