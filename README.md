# LingoSwap — Frontend

LingoSwap là ứng dụng luyện ngôn ngữ theo hình thức **video call ngẫu nhiên** — kết nối người dùng muốn luyện tập cùng nhau theo ngôn ngữ họ chọn, tương tự Omegle nhưng tập trung vào học ngoại ngữ.

---

## Tính năng chính

| Tính năng | Mô tả |
|---|---|
| **Xác thực** | Đăng nhập/đăng ký bằng email-password hoặc Google OAuth, quên mật khẩu qua OTP |
| **Matching ngẫu nhiên** | Tìm kiếm đối tác theo ngôn ngữ qua Socket.IO + Redis queue, countdown 5 phút |
| **Gọi trực tiếp bạn bè** | Gửi yêu cầu kết bạn, gọi video trực tiếp từ danh sách bạn bè |
| **Video call P2P** | WebRTC với remote video, local camera (PiP), controls (mute/camera/chat/end) |
| **Chat realtime** | Nhắn tin trong cuộc gọi qua Socket.IO, optimistic updates |
| **Đánh giá sau cuộc gọi** | Trang review với star rating, tags, comment, gửi yêu cầu kết bạn |
| **Profile** | Xem/chỉnh sửa hồ sơ, upload avatar (drag & drop), đổi mật khẩu, cài đặt theme/ngôn ngữ mặc định |
| **Admin dashboard** | Quản lý users (ban/delete), xử lý báo cáo vi phạm (resolve/dismiss), thống kê |
| **Dark / Light mode** | Chuyển đổi theme toàn app, lưu vào server + localStorage, đồng bộ khi login |
| **Đa ngôn ngữ** | Hỗ trợ Tiếng Việt / English, validation errors tự cập nhật khi đổi ngôn ngữ |

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
| Socket.IO Client | 4.8 | Realtime matching, chat, WebRTC signaling |
| @react-oauth/google | 0.13 | Google OAuth login |

### State Management
- **React Context** — ThemeContext, I18nContext, AuthContext
- Không dùng Redux/Zustand — state đơn giản, context đủ dùng

---

## Cấu trúc thư mục

```
src/
├── context/          # Global contexts (Theme, I18n, Auth)
├── hook/             # Custom hooks (useApi, useMatching, useWebRTC)
├── i18n/             # Translation types + locales (vi, en)
├── layout/           # PageShell — wrapper quản lý vị trí controls
├── library/          # Validation rules, axios instance
├── page/
│   ├── component/    # Shared components (ThemeToggle, LanguageToggle, GoogleSignInButton)
│   ├── admin/        # AdminPage + UserTable, ReportList, StatsBar
│   ├── forgot-password/ # ForgotPasswordPage + EmailStep, OtpPasswordStep
│   ├── home/         # HomePage + FriendList, RecentMatches, Header, MatchModal, NotificationDropdown, IncomingCallModal
│   ├── login/        # LoginPage, RegisterPage, AuthInput, GoogleCallbackPage
│   ├── meeting/      # MeetingPage, RemoteVideo, LocalVideo, ChatPanel
│   ├── profile/      # ProfilePage + ProfileCard, ProfileForm, ChangePasswordForm, SettingsForm
│   ├── review/       # ReviewPage
│   └── waiting/      # WaitingPage (matching queue)
├── router/           # Route definitions
├── services/         # API service configs (auth, user, socket)
└── theme/            # Color tokens (light/dark)
```

---

## Luồng chính

```
/ (Login) ──→ /home ──→ /waiting?lang=en ──→ /meeting ──→ /review
                 ↓
          MatchModal chọn ngôn ngữ
                 ↓
          FriendList → gọi trực tiếp bạn bè
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

**Test qua IP thật (LAN):**
- Tạo `.env.local` với `VITE_BACKEND_URL=http://192.168.x.x:5000`
- Chạy `npm run dev` — Vite in ra `Network: http://192.168.x.x:5173`
- Máy khác truy cập IP đó
- **Lưu ý**: WebRTC yêu cầu HTTPS hoặc localhost — test qua IP cần `npm run dev -- --https`

---

## Kiến trúc đáng chú ý

**Axios Interceptor** — tự động gắn `Authorization: Bearer <token>` vào mọi request, tự refresh token khi nhận 401, xếp hàng các request đang chờ trong lúc refresh.

**Socket Singleton** — `socketService` duy trì 1 socket connection duy nhất xuyên suốt app, tránh tạo nhiều connection khi navigate giữa các trang.

**WebRTC P2P** — `useWebRTC` hook quản lý `RTCPeerConnection`, signaling qua Socket.IO (`webrtc_offer`, `webrtc_answer`, `webrtc_ice_candidate`), tự động cleanup khi unmount.

**i18n extensible** — thêm ngôn ngữ mới chỉ cần tạo file `src/i18n/locales/xx.ts` implement interface `Translation` và đăng ký trong `I18nContext`.

**Validation đồng bộ i18n** — error messages của form validation được inject từ `t.validation`, tự cập nhật khi đổi ngôn ngữ mà không cần re-submit.

**Theme tokens** — không có hardcoded colors — tất cả màu sắc qua `theme.*` tokens, bao gồm `status` (online/busy/away/offline), `star`, `overlay`.

**PageShell** — wrapper component cho phép mỗi page tự quyết định vị trí hiển thị ThemeToggle + LanguageToggle (`top-left`, `top-right`, `bottom-left`, `bottom-right`, `none`).

---

## Routes

| Path | Page | Mô tả |
|---|---|---|
| `/` | LoginPage | Đăng nhập |
| `/register` | RegisterPage | Đăng ký |
| `/forgot-password` | ForgotPasswordPage | Quên mật khẩu (OTP) |
| `/auth/callback` | GoogleCallbackPage | Google OAuth callback |
| `/home` | HomePage | Trang chủ — friends, recent matches, find partner |
| `/waiting` | WaitingPage | Chờ matching (countdown 5 phút) |
| `/meeting` | MeetingPage | Video call + chat |
| `/review` | ReviewPage | Đánh giá sau cuộc gọi |
| `/profile` | ProfilePage | Hồ sơ cá nhân + settings + đổi mật khẩu |
| `/admin` | AdminPage | Admin dashboard — quản lý users + reports |

---

## Conventions

- **NO hardcoded strings** — mọi text UI qua `useI18n()` → `t.section.key`
- **NO hardcoded colors** — mọi màu qua `useTheme()` → `theme.category.token`
- **Page structure** — mỗi page có folder riêng trong `src/page/`, components con trong `component/` subfolder
- **API calls** — qua `useApi()` hook + service configs trong `src/services/`
- **Naming** — folder: kebab-case, file: PascalCase (components), camelCase (hooks/services)

Chi tiết đầy đủ trong `.kiro/steering/project-conventions.md`.
