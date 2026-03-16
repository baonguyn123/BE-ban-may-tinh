Cập nhật Auth Controller để hỗ trợ Frontend tích hợp UI/UX tốt hơn:

- Hàm updateProfile trong authController
- Hàm Login trong authController

1. Hàm `login`:
   - Bổ sung trả về thêm `fullname`, `phone`, `address` trong object user. (Frontend cần dữ liệu này để hiển thị tên người dùng trên Navbar và tự động điền form Checkout mà không cần gọi thêm API getProfile).
   - Security: Thay đổi hardcode 'secretKey' thành `process.env.JWT_SECRET || 'secretKey'`. Đề nghị BE sớm tạo file `.env` chứa `JWT_SECRET`.

2. Hàm `updateProfile`:
   - Fix bug nghiêm trọng: Bổ sung logic `if (address) updateData.address = address;`. (Trước đây hàm nhận req.body.address nhưng lại bỏ quên không đưa vào object để lưu xuống Database).

📌 TODO (Note cho BE):

- Hệ thống hiện tại đang thiếu hoàn toàn luồng API "Quên mật khẩu" (Forgot Password). BE cần lên kế hoạch bổ sung sớm (Tích hợp Nodemailer gửi OTP/Link) để FE có thể làm chức năng này.
