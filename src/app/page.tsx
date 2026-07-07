"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { BookOpen, Layers } from "lucide-react";

export default function AppSelection() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Exam Engine</h1>
          <p className="text-lg text-gray-600">Chọn chế độ học tập phù hợp với bạn</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Exam Engine Card */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary group bg-white"
            onClick={() => router.push('/exams')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Luyện Thi Trắc Nghiệm</CardTitle>
              <p className="text-base mt-2 text-gray-600">
                Làm bài tập, ôn luyện các bộ đề thi trắc nghiệm theo chủ đề hoặc ngẫu nhiên.
              </p>
            </CardHeader>
            <CardContent className="text-center text-sm text-gray-500">
              Hỗ trợ tự động chấm điểm, tính giờ và thống kê kết quả.
            </CardContent>
          </Card>

          {/* Flashcard Engine Card */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-green-500 group bg-white"
            onClick={() => router.push('/flashcards')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Học Flashcard</CardTitle>
              <p className="text-base mt-2 text-gray-600">
                Học từ vựng nhanh chóng với thẻ ghi nhớ. Lật thẻ để xem nghĩa và cách đọc.
              </p>
            </CardHeader>
            <CardContent className="text-center text-sm text-gray-500">
              Tự động đồng bộ từ vựng từ file Excel, học mọi lúc mọi nơi.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
