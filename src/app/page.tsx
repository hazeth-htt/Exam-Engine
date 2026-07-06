"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { QuestionBank } from "@/types";
import { BankImporter } from "@/features/question-bank/components/BankImporter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function Home() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadBanks = async () => {
    setLoading(true);
    const data = await storage.getQuestionBanks();
    setBanks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa ngân hàng này?")) {
      await storage.deleteQuestionBank(id);
      loadBanks();
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Exam Engine</h1>
          <p className="text-gray-500">Personal Exam Generator</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-20">Đang tải dữ liệu...</p>
      ) : banks.length === 0 ? (
        <BankImporter onImported={loadBanks} />
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-medium mb-4 text-gray-800">Ngân hàng câu hỏi của bạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banks.map((bank) => (
                <Card 
                  key={bank.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-gray-200" 
                  onClick={() => router.push(`/bank/${bank.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-primary">{bank.metadata.subject}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-error hover:bg-error/10" onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(bank.id);
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Phiên bản: {bank.metadata.version}</p>
                      <p>Tổng số câu: {bank.questions.length}</p>
                      <p>Templates: {bank.examTemplates.length}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 text-center text-gray-800">Thêm ngân hàng mới</h2>
            <BankImporter onImported={loadBanks} />
          </section>
        </div>
      )}
    </main>
  );
}
