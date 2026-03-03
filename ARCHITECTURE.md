# System Architecture - DuctPro

Tài liệu này mô tả chi tiết kiến trúc bên trong của ứng dụng DuctPro. Hệ thống đã được cấu trúc lại hoàn toàn dựa trên một luồng dữ liệu một chiều (Unidirectional Pipeline) siêu sạch thông qua lớp **Project Orchestrator**.

## Sơ đồ Khối Cốt Lõi (The Pipeline)

Mọi thao tác nhập liệu từ UI (Người dùng nhập tay, AI Parse, hoặc Import Excel) đều đi qua một dây chuyền phân tích tuyến tính:

1. **Parse Engine (Bóc Tách Dữ Liệu)**
   Nhận chuỗi Text thô từ môi trường và hiểu chúng.
   - Hỗ trợ *Regex*: Tốc độ siêu nhanh, đáng tin cậy cho Format chuẩn mực.
   - Hỗ trợ *AI Strategy*: LLMs (Gemini / OpenAI) dùng để đoán cấu trúc tên dị biệt.
   - *Batch Parsing*: Chạy một Prompt gộp cho hàng chục item giúp tiết kiệm băng thông mạng cực lớn.

2. **Rule Engine (Cỗ Máy Quy Tắc)**
   Điền các số liệu mặc định bị thiếu bằng cách dự đoán luật lệ.
   - Cho vật tư này thì tự động gắn *Mí Ghép (Seam)* tương ứng.
   - Khớp *Trục bích (Connectors)* phù hợp giữa 2 đầu ống.

3. **Calculation Engine (Hệ Thống Tính Toán Động Học)**
   Đây là bộ não vật lý và toán học không gian cho ứng dụng.
   - Lưu trữ các công thức nội suy diện tích, số lượng bích, chiều dài nẹp C, v.v.
   - Hỗ trợ **Adaptive Correction Factor**: Module học máy siêu nhẹ giúp hệ số điều chỉnh tự uốn nắn khớp với lịch sử sản xuất của xưởng thay vì cứng nhắc theo lý thuyết sách vở.

4. **Assembly Engine (Bóc Tách Phụ Kiện)**
   Tổng hợp ra danh sách vật tư phụ. (Bulong, ốc vít, ron cao su, keo silicon) dựa trên thuộc tính mí ghép và số lượng tính toán.

5. **Nesting Engine (Tối ưu Cắt Khổ Tôn)**
   Tối ưu hóa khả năng sử dụng tôn nguyên tấm. Thay vì vứt bỏ những phần chưa dùng, hệ thống sử dụng phiên bản cải tiến của thuật toán Bin-Packing.
   - **Dynamic Length Sheet**: Tấm tôn ảo dài tối đa 4m, chỉ sử dụng đúng lượng cần thiết. Báo cáo tỷ lệ rác thải (Waste Percentage).

## Hệ Thống Lưu Trữ và Giao Ngôn (Cache & Determinism)

* **Cache 3 Tầng**: Nhằm tránh việc UI lag do tái tính toán những cấu hình tương tự nhau khi thay đổi State. Pipeline có Cache bóc tách, Cache phép toán và Cache Nesting. Cả ba có thể phục hồi ngay lập tức nếu input không đổi.
* **Freeze Context (Tính Định Mệnh)**: Khi Lưu một dự án, phiên bản API AI, giá trị Correction và Logic Nesting hiện tại được lưu kẹp lại vào siêu dữ liệu (Metadata). Nhờ vậy, ngay cả khi tháng sau Sếp thay đổi luật hiệu suất xưởng mới ở Settings, bảng báo giá Dự án làm tuần trước tải lại vẫn ra đúng một con số, không bị "nhảy biến".

## Cấu trúc Lớp Giao Diện (UI Layer)

* **Next.js 15 App Router**: Render Server/Client tiên tiến.
* Theo sát phương pháp luận Component-first, lấy `page.tsx` làm nơi nắm trạng thái (Local Store) sau đó phân phát cho `ProjectCard`, `DuctTable`, `DuctSummary`. 
* Dữ liệu trả từ Orchestrator được gắn một ID tĩnh để làm key cho React nhằm đảm bảo DOM chỉ thay đổi những ô giá trị thực sự sửa. Mọi thao tác đều không gọi logic tính toán tại Hook UI mà thông qua Singleton `ProjectService`.

*Tài liệu kiến trúc (Version 2.0.0).*
