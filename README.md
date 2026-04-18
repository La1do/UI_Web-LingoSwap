# LingoSwap — Frontend

LingoSwap là ứng dụng luyện ngôn ngữ theo hình thức **video call ngẫu nhiên** — kết nối người dùng muốn luyện tập cùng nhau theo ngôn ngữ họ chọn, tương tự Omegle nhưng tập trung vào học ngoại ngữ.

---

## Tính năng chính

| Tính năng | Mô tả |
|---|---|
| Xác thực | Đăng nhập / Đăng ký bằng email-password hoặc Google OAuth |
| Matching | Tìm kiếm đối tác theo ngôn ngữ qua Socket.IO + Redis queue |
| Video call | Màn hình meeting với remote video, local camera (PiP), controls |
| Chat realtime | Nhắn tin trong cuộc gọi qua Socket.IO |
| Đánh giá | Trang review sau khi kết thúc cuộc gọi |
| Dark / Light mode | Chuyển đổi theme toàn app, lưu vào localStorage |
| Đa ngôn ngữ | Hỗ trợ Tiếng Việt / English, dễ mở rộng thêm ngôn ngữ |

---

## Tech Stack

### Frontend
| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first styling |
| React Router DOM | 7 | Client-side routing |
| Axios | 1.15 | HTTP client với interceptor tự refresh token |
| Socket.IO Client | 4.8 | Realtime matching & chat |
| @react-oauth/google | 0.13 | Google OAuth login |

### State Management
- **React Context** — ThemeContext, I18nContext, AuthContext
- Không dùng Redux/Zustand — state đơn giản, context đủ dùng

---

## Cấu trúc thư mục

```
src/
├── context/          # Global contexts (Theme, I18n, Auth)
├── hook/             # Custom hooks (useApi, useMatching)
├── i18n/             # Translation types + locales (vi, en)
├── layout/           # PageShell — wrapper quản lý vị trí controls
├── library/          # Validation rules, axios instance
├── page/
│   ├── component/    # Shared components (ThemeToggle, LanguageToggle, GoogleSignInButton)
│   ├── home/         # HomePage + FriendList, RecentMatches, Header, MatchModal
│   ├── login/        # LoginPage, RegisterPage, AuthInput, GoogleCallbackPage
│   ├── meeting/      # MeetingPage, RemoteVideo, LocalVideo, ChatPanel
│   ├── review/       # ReviewPage
│   └── waiting/      # WaitingPage (matching queue)
├── router/           # Route definitions
├── services/         # API service configs (auth, socket)
└── theme/            # Color tokens (light/dark)
```

---

## Luồng chính

```
/ (Login) ──→ /home ──→ /waiting?lang=en ──→ /meeting ──→ /review
                                ↑
                         MatchModal chọn ngôn ngữ
```

---

## Cài đặt & chạy

```bash
npm install
npm run dev
```

### Biến môi trường `.env`

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Kiến trúc đáng chú ý

**Axios Interceptor** — tự động gắn `Authorization: Bearer <token>` vào mọi request, tự refresh token khi nhận 401, xếp hàng các request đang chờ trong lúc refresh.

**Socket Singleton** — `socketService` duy trì 1 socket connection duy nhất xuyên suốt app, tránh tạo nhiều connection khi navigate giữa các trang.

**i18n extensible** — thêm ngôn ngữ mới chỉ cần tạo file `src/i18n/locales/xx.ts` implement interface `Translation` và đăng ký trong `I18nContext`.

**Validation đồng bộ i18n** — error messages của form validation được inject từ `t.validation`, tự cập nhật khi đổi ngôn ngữ mà không cần re-submit.
