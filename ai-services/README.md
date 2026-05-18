# AI Services - Backend Trợ lý Ảo

Dịch vụ microservice dựa trên Flask cung cấp các khả năng AI cho trợ lý ảo, bao gồm chuyển đổi giọng nói thành văn bản, văn bản thành giọng nói, phân loại ý định và truy xuất câu hỏi thường gặp.

## Tính năng

- **Chuyển đổi Giọng nói thành Văn bản (STT)**: Chuyển đổi tệp âm thanh thành văn bản sử dụng mô hình Whisper
- **Chuyển đổi Văn bản thành Giọng nói (TTS)**: Tạo giọng nói tiếng Việt từ văn bản sử dụng gTTS
- **Phân loại Ý định**: Phân loại ý định người dùng sử dụng học máy
- **Truy xuất Câu hỏi thường gặp (FAQ)**: Tìm kiếm ngữ nghĩa cho các câu hỏi thường gặp sử dụng sentence embeddings

## Cấu trúc Dự án

```
ai-services/
├── app.py                    # Ứng dụng Flask chính
├── routes/                   # Các route API
│   ├── stt_routes.py        # Endpoints chuyển đổi giọng nói thành văn bản
│   ├── tts_routes.py        # Endpoints chuyển đổi văn bản thành giọng nói
│   ├── intent_routes.py     # Endpoints phân loại ý định
│   └── faq_routes.py        # Endpoints truy xuất FAQ
├── services/                 # Lớp logic nghiệp vụ
│   ├── stt_service.py       # Triển khai dịch vụ STT
│   ├── tts_service.py       # Triển khai dịch vụ TTS
│   ├── intent_service.py    # Triển khai dịch vụ ý định
│   └── faq_service.py       # Triển khai dịch vụ FAQ
├── providers/                # Các nhà cung cấp dịch vụ bên ngoài
│   ├── whisper_provider.py  # Nhà cung cấp STT Whisper
│   ├── tts_provider.py      # Nhà cung cấp gTTS
│   └── intent_provider.py   # Nhà cung cấp mô hình ý định
├── models/                   # Các mô hình đã huấn luyện và embeddings
│   ├── faq_embeddings.npy   # Embeddings câu hỏi FAQ
│   ├── faq_index_map.json   # Ánh xạ chỉ mục FAQ
│   ├── intent_model.pkl     # Bộ phân loại ý định đã huấn luyện
│   └── vectorizer.pkl       # Vectorizer văn bản
├── ml/                       # Kịch bản huấn luyện học máy
│   ├── build_faq_embeddings.py  # Xây dựng embeddings FAQ
│   └── train_intent.py           # Huấn luyện bộ phân loại ý định
├── data/                     # Dữ liệu huấn luyện
└── temp/                     # Lưu trữ tệp tạm thời
```

## API Endpoints

### Chuyển đổi Giọng nói thành Văn bản
- **POST** `/stt/transcribe`
  - **Mô tả**: Chuyển đổi tệp âm thanh thành văn bản
  - **Yêu cầu**: `multipart/form-data` với tệp `audio`
  - **Phản hồi**: `{"success": true, "text": "văn bản đã chuyển đổi"}`

### Chuyển đổi Văn bản thành Giọng nói
- **POST** `/tts/speak`
  - **Mô tả**: Chuyển đổi văn bản thành giọng nói
  - **Yêu cầu**: `{"text": "văn bản cần chuyển đổi"}`
  - **Phản hồi**: Tệp âm thanh (MP3)

### Phân loại Ý định
- **POST** `/intent/predict`
  - **Mô tả**: Phân loại ý định người dùng
  - **Yêu cầu**: `{"text": "văn bản đầu vào của người dùng"}`
  - **Phản hồi**: `{"success": true, "intent": "ý định_dự_đoán"}`

### Truy xuất FAQ
- **POST** `/faq`
  - **Mô tả**: Truy xuất câu trả lời FAQ dựa trên độ tương đồng ngữ nghĩa
  - **Yêu cầu**: `{"query": "câu hỏi của người dùng"}`
  - **Phản hồi**: `{"success": true, "intent": "câu_trả_lời_faq"}`

### Kiểm tra Sức khỏe
- **GET** `/`
  - **Mô tả**: Kiểm tra xem dịch vụ có đang chạy không
  - **Phản hồi**: `{"success": true, "message": "AI Service Running"}`

## Công nghệ Sử dụng

- **Backend**: Flask
- **Chuyển đổi Giọng nói thành Văn bản**: Faster-Whisper (mô hình medium)
- **Chuyển đổi Văn bản thành Giọng nói**: Google Text-to-Speech (gTTS)
- **Phân loại Ý định**: scikit-learn với TF-IDF + Logistic Regression
- **Truy xuất FAQ**: Sentence Transformers (multilingual-e5-small)
- **Machine Learning**: PyTorch, Transformers, scikit-learn
- **Audio Processing**: FFmpeg, librosa
- **Ngôn ngữ**: Python 3.11

## 🐳 Docker Configuration

### Dockerfile Features

- **Multi-stage build** cho tối ưu kích thước
- **Python 3.11 slim base image**
- **FFmpeg** cho xử lý audio
- **Health check** để monitor service
- **Production-ready configuration**

### Docker Compose Services

- **AI Services Container**: Flask app trên port 5000
- **Volume mounts** cho models và data
- **Health check** với automatic restart
- **Network isolation** cho security

### Environment Variables

- `FLASK_ENV=production`: Production mode
- `PYTHONPATH=/app`: Python path configuration

## Cài đặt

### Local Development

1. Clone repository:
```bash
git clone <repository-url>
cd ai-services
```

2. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

3. Chuẩn bị mô hình:
```bash
# Huấn luyện bộ phân loại ý định
python ml/train_intent.py

# Xây dựng embeddings FAQ
python ml/build_faq_embeddings.py
```

### Docker Deployment

1. Build và chạy với Docker:
```bash
# Build image
docker build -t voice-assistant-ai-services .

# Run container
docker run -p 5000:5000 voice-assistant-ai-services
```

2. Sử dụng Docker Compose:
```bash
# Start service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop service
docker-compose down
```

## Sử dụng

### Local Development

1. Khởi động server:
```bash
python app.py
```

2. Dịch vụ sẽ có sẵn tại `http://localhost:5000`

### Docker

1. Khởi động với Docker:
```bash
docker-compose up -d
```

2. Dịch vụ sẽ có sẵn tại `http://localhost:5000`

3. Kiểm tra health:
```bash
curl http://localhost:5000
```

## Cấu hình

### Mô hình
- **Mô hình Whisper**: Sử dụng mô hình kích thước medium với suy luận CPU và lượng tử hóa int8
- **Embeddings FAQ**: Sử dụng mô hình multilingual-e5-small cho văn bản tiếng Việt
- **Mô hình Ý định**: Logistic Regression với vector hóa TF-IDF (n-grams: 1-2, max_features: 5000)

### Dịch vụ FAQ
- **Ngưỡng Tương đồng**: 0.88 (điểm tự tin tối thiểu)
- **Từ khóa Chặn**: Lọc ra các câu hỏi mở chứa:
  - "hướng dẫn", "cách", "làm sao", "như thế nào", "tại sao", "gợi ý", "nên", "help"

## Yêu cầu Dữ liệu

### Huấn luyện Ý định
- Đặt dữ liệu huấn luyện tại `data/data_R.csv`
- Định dạng: CSV với các cột `text` và `label`

### Kiến thức FAQ
- Đặt dữ liệu FAQ tại `data/faq_knowledge.json`
- Định dạng: Mảng JSON với các đối tượng chứa các trường `question` và `answer`

## Phát triển

### Thêm Dịch vụ Mới
1. Tạo provider trong thư mục `providers/`
2. Tạo service trong thư mục `services/`
3. Tạo routes trong thư mục `routes/`
4. Đăng ký blueprint trong `app.py`

### Huấn luyện Mô hình
- Sử dụng các kịch bản trong thư mục `ml/` để huấn luyện/huấn luyện lại mô hình
- Các mô hình được lưu vào thư mục `models/`
- Cập nhật các provider dịch vụ để sử dụng mô hình mới

## Lưu ý

- Các tệp tạm thời được tự động dọn dẹp sau khi xử lý
- Dịch vụ được cấu hình để hỗ trợ ngôn ngữ tiếng Việt
- Tất cả xử lý âm thanh được thực hiện đồng bộ
- Dịch vụ FAQ trả về `None` cho các câu hỏi dưới ngưỡng tự tin hoặc chứa từ khóa bị chặn
