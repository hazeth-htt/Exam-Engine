const xlsx = require("xlsx");
const fs = require("fs");
const crypto = require("crypto");

const wb = xlsx.readFile("data/Tong_hop_tu_vung_IT_Nihongo.xlsx");
const ws = wb.Sheets["Vocabulary"];
const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

const rows = data.slice(1).filter(r => r[0] && r[2]);

const cards = rows.map((r, i) => {
  return {
    id: "card_" + crypto.randomUUID(),
    front: {
      kanji: r[0],
      hiragana: r[1] || ""
    },
    back: {
      meaning: r[2]
    }
  };
});

const deck = {
  id: "deck-it-basic",
  metadata: {
    title: "Từ vựng IT cơ bản",
    description: "Tổng hợp từ vựng IT chuyên ngành (42 từ)",
    version: "1.0",
    createdAt: Date.now()
  },
  cards: cards
};

fs.writeFileSync("data/flashcards.json", JSON.stringify([deck], null, 2));
console.log("Created data/flashcards.json with", cards.length, "cards.");
