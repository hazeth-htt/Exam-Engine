"use client";

import { useEffect, useState, useMemo } from "react";
import { storage } from "@/lib/storage";
import { QuestionBank } from "@/types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { MacOSFolderIcon } from "@/components/icons/MacOSFolderIcon";

function WorkspaceLayoutInner({ children }: { children: React.ReactNode }) {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const loadBanks = async () => {
    try {
      const currentBanks = await storage.getQuestionBanks();
      const hasInit = localStorage.getItem('hasInitBanks');
      if (currentBanks.length === 0 && !hasInit) {
        const res = await fetch('/api/banks');
        const defaultBanks = await res.json();
        for (const bank of defaultBanks) {
          if (bank && bank.id) {
            await storage.saveQuestionBank(bank);
          }
        }
        localStorage.setItem('hasInitBanks', 'true');
      } else if (!hasInit) {
        localStorage.setItem('hasInitBanks', 'true');
      }
    } catch(e) {
      console.error(e);
    }
    const data = await storage.getQuestionBanks();
    setBanks(data);
  };

  useEffect(() => {
    loadBanks();
  }, [pathname, searchParams]);

  const subjects = useMemo(() => {
    return Array.from(new Set(banks.map(b => b.metadata.subject).filter(Boolean)));
  }, [banks]);

  const handleCreateSubject = async () => {
    const subject = window.prompt("Nhập tên môn học mới:");
    if (!subject) return;
    try {
      const newBankId = `bank_${Date.now()}`;
      const newBank = {
        id: newBankId,
        metadata: {
          subject: subject,
          bankName: "Ngân hàng mặc định",
          version: "1.0",
          author: "Local User"
        },
        examTemplates: [
          {
            id: "tpl_10",
            name: "Luyện tập nhanh (10 câu)",
            description: "Lấy ngẫu nhiên 10 câu hỏi từ ngân hàng",
            shuffleQuestions: true,
            shuffleAnswers: true,
            rules: [{ type: "default", count: 10 }]
          },
          {
            id: "tpl_20",
            name: "Luyện tập tiêu chuẩn (20 câu)",
            description: "Lấy ngẫu nhiên 20 câu hỏi từ ngân hàng",
            shuffleQuestions: true,
            shuffleAnswers: true,
            rules: [{ type: "default", count: 20 }]
          },
          {
            id: "tpl_all",
            name: "Luyện tập toàn bộ",
            description: "Ôn tập tất cả câu hỏi có trong ngân hàng",
            shuffleQuestions: true,
            shuffleAnswers: true,
            rules: [{ type: "default", count: 9999 }]
          }
        ],
        questions: []
      };

      await storage.saveQuestionBank(newBank);
      
      fetch('/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject })
      }).catch(e => console.log('Server sync failed'));

      await loadBanks();
      router.push(`/exams?subject=${encodeURIComponent(subject)}`);
    } catch(e) {}
  };

  const currentSubject = searchParams.get('subject');

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-sm text-[#333333]">
      {/* Sidebar - Mac OS Big Sur Style */}
      <aside className="w-[260px] bg-sidebar backdrop-blur-3xl border-r border-black/5 flex flex-col shrink-0 relative z-20">
        {/* Mac OS Window Controls (Traffic Lights) */}
        <div className="h-14 flex items-center px-5 space-x-2 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 space-y-[2px]">
          <div className="mt-2 mb-4 px-3">
            <button 
              onClick={() => router.push('/exams')}
              className={`w-full flex items-center px-3 py-1.5 rounded-md text-[13px] transition-colors ${!currentSubject && pathname === '/exams' ? 'bg-accent text-white font-medium shadow-sm' : 'text-[#333333] hover:bg-black/5'}`}
            >
              <span className="truncate">Trang chủ</span>
            </button>
          </div>

          <div className="text-[11px] font-semibold text-muted tracking-wide px-3 mb-2 flex justify-between items-center group">
            <span>Môn học</span>
            <button 
              onClick={handleCreateSubject} 
              className="text-muted hover:text-foreground transition-all p-0.5 hover:bg-black/5 rounded"
              title="Thêm Môn học mới"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {subjects.map(sub => {
            const isSelected = currentSubject === sub && pathname === '/exams';
            return (
              <button 
                key={sub}
                onClick={() => router.push(`/exams?subject=${encodeURIComponent(sub)}`)}
                className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-md text-[13px] transition-colors ${isSelected ? 'bg-accent text-white font-medium shadow-sm' : 'text-[#333333] hover:bg-black/5'}`}
              >
                <MacOSFolderIcon className={`w-[18px] h-[18px] ${isSelected ? 'opacity-100 drop-shadow-sm' : 'opacity-80 grayscale-[30%]'}`} />
                <span className="truncate">{sub}</span>
              </button>
            )
          })}
          
          {subjects.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted">
              Chưa có môn học nào.
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">

        {/* Workspace Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-8 py-8 pb-32">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

import { Suspense } from "react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Đang tải Workspace...</div>}>
      <WorkspaceLayoutInner>{children}</WorkspaceLayoutInner>
    </Suspense>
  );
}
