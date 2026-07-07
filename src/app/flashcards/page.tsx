"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { FlashcardDeck } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";

export default function FlashcardDashboard() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadDecks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flashcards');
      if (res.ok) {
        const defaultDecks = await res.json();
        for (const deck of defaultDecks) {
          if (deck && deck.id) {
            await storage.saveFlashcardDeck(deck);
          }
        }
      }
    } catch(e) {
      console.error("Failed to sync flashcard decks", e);
    }

    const data = await storage.getFlashcardDecks();
    setDecks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDecks();
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto bg-gray-50/50">
      <div className="flex items-center mb-10 gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-green-700">Học Từ Vựng Flashcard</h1>
          <p className="text-gray-500">Lật thẻ để ghi nhớ từ vựng hiệu quả</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-20">Đang tải dữ liệu...</p>
      ) : decks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chưa có bộ từ vựng nào</h3>
          <p className="text-gray-500 mt-2">Hãy đặt file flashcards.json vào thư mục data để hệ thống tự động đồng bộ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card 
              key={deck.id} 
              className="hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-green-500 group bg-white flex flex-col" 
            >
              <CardHeader className="pb-3 border-b border-gray-50 flex-none">
                <CardTitle className="text-xl text-green-700 group-hover:text-green-800 transition-colors">
                  {deck.metadata.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                  {deck.metadata.description}
                </p>
                <div className="mb-4 text-sm font-medium">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {deck.cards.length} thẻ
                  </span>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() => router.push(`/flashcards/study/${deck.id}`)}
                  >
                    Lật thẻ
                  </Button>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => router.push(`/flashcards/quiz/${deck.id}`)}
                  >
                    Trắc nghiệm
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
