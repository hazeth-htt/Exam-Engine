# 📚 Hướng Dẫn Sử Dụng Exam Engine

Exam Engine là hệ thống sinh đề thi và làm bài trắc nghiệm cá nhân. Toàn bộ dữ liệu được lưu trữ tự động cục bộ trên trình duyệt (IndexedDB) của bạn, đảm bảo tốc độ cao, riêng tư và không lo mất bài khi vô tình tải lại (F5) trang.

---

## 1. Cấu trúc File JSON Ngân hàng câu hỏi (Question Bank)

Hệ thống yêu cầu file import phải theo đúng định dạng chuẩn. Dưới đây là một bộ file JSON mẫu hoàn chỉnh giúp bạn dễ dàng hình dung:

```json
{
  "metadata": {
    "subject": "Tiếng Anh Cơ Bản",
    "version": "1.0",
    "author": "Nguyễn Văn A"
  },
  "examTemplates": [
    {
      "id": "tpl_1",
      "name": "Đề thi thử 15 phút",
      "description": "Bao gồm 2 câu ngữ pháp và 1 câu từ vựng. Trộn cả câu và đáp án.",
      "shuffleQuestions": true,
      "shuffleAnswers": true,
      "rules": [
        {
          "type": "grammar",
          "count": 2
        },
        {
          "type": "vocabulary",
          "count": 1
        }
      ]
    }
  ],
  "questions": [
    {
      "id": "q1",
      "type": "grammar",
      "difficulty": 1,
      "question": "He _____ to the cinema yesterday.",
      "choices": ["goes", "went", "going", "gone"],
      "answer": "went",
      "explanation": "Có 'yesterday' nên động từ chia ở thì quá khứ đơn."
    },
    {
      "id": "q2",
      "type": "grammar",
      "difficulty": 2,
      "question": "She has been working here _____ 3 years.",
      "choices": ["in", "since", "for", "during"],
      "answer": "for",
      "explanation": "Dùng 'for' với khoảng thời gian (3 years)."
    },
    {
      "id": "q3",
      "type": "vocabulary",
      "difficulty": 2,
      "question": "Chọn các từ trái nghĩa với 'Happy' (Chọn nhiều đáp án):",
      "choices": ["Sad", "Joyful", "Depressed", "Glad"],
      "answer": ["Sad", "Depressed"],
      "explanation": "'Sad' và 'Depressed' đều diễn tả sự buồn bã, trái nghĩa với 'Happy'."
    }
  ]
}
```

### Phân tích ý nghĩa các trường (Fields):

1. **`metadata`**: 
   - Thông tin chung để hiển thị trên giao diện (Tên môn học, phiên bản, tác giả).

2. **`examTemplates`**: 
   - Khai báo các loại "Mẫu đề thi". Bạn có thể khai báo bao nhiêu tuỳ ý (ví dụ: Thi 15 phút, Thi giữa kỳ, Thi cuối kỳ...).
   - `rules`: Hệ thống sẽ đọc `rules` để lấy ngẫu nhiên số câu hỏi tương ứng. (VD: Lấy ngẫu nhiên `2` câu có thuộc tính `"type": "grammar"`).
   - `shuffleQuestions`: Điền `true` nếu muốn thuật toán tự động đổi thứ tự các câu hỏi.
   - `shuffleAnswers`: Điền `true` nếu muốn xáo trộn ngẫu nhiên vị trí các đáp án (A, B, C, D).

3. **`questions`**:
   - `type`: Từ khoá dùng để ánh xạ với `rules` ở trên.
   - `difficulty`: Độ khó (Tuỳ chọn: 1, 2, 3 hoặc Dễ, Trung Bình, Khó).
   - `choices`: Danh sách các lựa chọn (bỏ trống nếu là câu hỏi tự điền chữ - tuy nhiên hiện tại hệ thống tối ưu cho trắc nghiệm).
   - `answer`: Chứa đáp án chính xác. Nếu là câu hỏi **chọn nhiều đáp án**, bạn khai báo bằng mảng (vd: `["Sad", "Depressed"]`).
   - `explanation`: Giải thích sẽ hiện ra ở phần Xem Lại (Review) sau khi thi xong.

---

## 2. Các bước trải nghiệm ứng dụng

1. **Import Ngân Hàng Câu Hỏi**: 
   - Truy cập trang chủ của ứng dụng.
   - Copy nội dung JSON mẫu bên trên lưu thành file `data.json`.
   - Bấm vào **"Chọn file JSON"** và tải file lên.
   
2. **Sinh Đề Thi**:
   - Nhấn vào card môn học vừa tạo.
   - Bạn sẽ thấy Cấu trúc đề (Template) "Đề thi thử 15 phút" hiện ra.
   - Bấm **"Bắt đầu làm bài"**. Thuật toán sẽ phân tích Rules, bốc ngẫu nhiên câu hỏi, trộn đáp án (nếu cấu hình `true`) và chuyển bạn vào giao diện làm bài.

3. **Làm bài (Exam Player)**:
   - Cột trái: Hiển thị ma trận câu hỏi (Màu xám: chưa làm, màu xanh: đã làm).
   - Lựa chọn đáp án được lưu xuống bộ nhớ tạm của trình duyệt liên tục bằng công nghệ IndexedDB. Bạn cứ thử bấm tải lại (F5) trang mà xem, đáp án không hề bị mất.
   - Nhấn nút **Nộp bài** ở cuối menu bên trái.

4. **Xem kết quả & Phân tích (Result & Review)**:
   - Điểm số và tỷ lệ phần trăm tự động tính toán.
   - Bấm nút **"Xem lại đáp án"** để đối chiếu. Ở trang này, các lựa chọn của bạn sẽ được so với đáp án gốc (tick Xanh = đúng, chéo Đỏ = sai).
   - Khối **Giải thích** (nếu có khai báo) cũng được hiển thị chi tiết bên dưới.
