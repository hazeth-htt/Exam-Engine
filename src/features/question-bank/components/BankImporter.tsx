"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";
import { QuestionBankSchema } from "@/lib/validation";
import { storage } from "@/lib/storage";

export function BankImporter({ onImported }: { onImported?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      const parseResult = QuestionBankSchema.safeParse(json);
      if (!parseResult.success) {
        throw new Error("Cấu trúc JSON không hợp lệ. " + parseResult.error.issues[0].message);
      }

      const bankData = parseResult.data;
      const bank = {
        ...bankData,
        id: crypto.randomUUID()
      };

      await storage.saveQuestionBank(bank as any);
      
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onImported) onImported();
      
    } catch (err: any) {
      setError(err.message || "Lỗi khi đọc file JSON.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-dashed border-2">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Import Question Bank</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-500 text-center mb-6">
          Chỉ hỗ trợ định dạng file JSON với cấu trúc hợp lệ.
        </p>
        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isImporting}
        >
          {isImporting ? "Đang xử lý..." : "Chọn file JSON"}
        </Button>
        {error && (
          <p className="mt-4 text-sm text-error bg-error/10 p-3 rounded-md w-full text-center">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
