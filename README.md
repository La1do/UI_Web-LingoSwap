# LingoSwap — Frontend

LingoSwap là ứng dụng luyện ngôn ngữ theo hình thức **video call ngẫu nhiên** — kết nối người dùng muốn luyện tập cùng nhau theo ngôn ngữ họ chọn.

---

## Tính năng

| Tính năng | Mô tả |
|---|---|
| **Xác thực** | Đăng nhập/đăng ký email-password hoặc Google OAuth, quên mật khẩu qua OTP email |
| **Phân quyền route** | Route guard theo role (user/admin), chưa đăng nhập redirect về login, sai role tự logout |
| **App Loader** | Loading screen khi khởi động app (verify token), logo xoay tròn |
| **Matching ngẫu nhiên** | Tìm đối tác theo ngôn ngữ qua Socket.IO, hiển thị trạng thái chờ + elapsed time |
| **Gọi trực tiếp bạn bè** | Gọi video trực tiếp từ danh sách bạn bè, incoming call modal |
| **Video call P2P** | WebRTC thuần (không thư viện), STUN server, remote video + local PiP, mute/camera/end |
| **Chat realtime** | Nhắn tin trong cuộc gọi + chat window bạn bè, gửi ảnh qua API, status indicator (sending/failed) |
| **Trang Nhắn tin** | `/messages` — sidebar bạn bè + chat area, auto-resize textarea |
| **Đánh giá sau cuộc gọi** | Star rating, comment, kết bạn với đối tác, báo cáo vi phạm |
| **Streak & Calendar** | Hiển thị chuỗi ngày học, animation lửa khi earn streak, calendar modal theo tháng |
| **Streak Celebration** | Animation lửa bừng lên theo ngày trong tuần, slide animation khi T2 có streak từ CN |
| **Profile** | Xem/chỉnh sửa hồ sơ, upload avatar Cloudinary, đổi mật khẩu, cài đặt theme/ngôn ngữ |
| **Báo cáo vi phạm** | Báo cáo từ chat window, meeting page, review page, recent matches |
| **Kháng cáo tài khoản** | Page `/appeal?token=xxx` — nộp đơn kháng cáo khi bị ban |
| **Admin dashboard** | Quản lý users (ban/delete), xử lý reports (resolve + ban duration), xử lý appeals, thống kê |
| **Admin login** | Trang đăng nhập riêng `/admin/login`, check role trước khi vào |
| **Error pages** | 404 NotFoundPage, 500 ErrorPage với logo + nút về home/login |
| **Dark / Light mode** | Chuyển đổi theme toàn app, đồng bộ server + localStorage |
| **Đa ngôn ngữ (i18n)** | Tiếng Việt / English, không hardcode string, validation tự cập nhật khi đổi ngôn ngữ |

---

## Tech Stack

| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first styling |
| React Router DOM | 7 | Client-side routing + route guards |
| Axios | 1.15 | HTTP client, auto refresh token interceptor |
| Socket.IO Client | 4.8 | Realtime: matching, chat, WebRTC signaling, friend status |
| @react-oauth/google | 0.13 | Google OAuth login |
| WebRTC (browser API) | — | P2P video/audio call, không dùng thư viện ngoài |

---

## Cấu trúc thư mục

```
src/
├── assets/               # Static assets (hero.png, logo...)
├── context/              # Global React contexts
│   ├── AuthContext.tsx   # User auth state, token verify, role
│   ├── ThemeContext.tsx  # Light/dark mode
│   ├── I18nContext.tsx   # Ngôn ngữ (vi/en)
│   └── FriendContext.tsx # Danh sách bạn bè, online status realtime
├── hook/                 # Custom hooks
│   ├── useApi.ts         # Generic API call hook với loading/error state
│   ├── useMatching.ts    # Socket matching queue logic
│   └── useWebRTC.ts      # RTCPeerConnection, media, signaling
├── i18n/
│   ├── types.ts          # Translation interface
│   └── locales/
│       ├── vi.ts         # Tiếng Việt
│       └── en.ts         # English
├── layout/
│   └── PageShell.tsx     # Wrapper quản lý vị trí ThemeToggle + LanguageToggle
├── library/
│   ├── axios.customize.ts # Axios instance + interceptors (auth, refresh)
│   └── validation.ts     # Form validation rules
├── page/
│   ├── admin/            # AdminPage, AdminLoginPage
│   │   └── component/    # UserTable, ReportList, AppealList, StatsBar
│   ├── appeal/           # AppealPage (/appeal?token=xxx)
│   ├── call-ended/       # CallEndedPage (sau direct call)
│   ├── component/        # Shared: ThemeToggle, LanguageToggle, GoogleSignInButton, AppLoader
│   ├── direct-call/      # DirectCallPage (gọi trực tiếp bạn bè)
│   ├── error/            # NotFoundPage (404), ErrorPage (500), ErrorLayout
│   ├── forgot-password/  # ForgotPasswordPage + EmailStep, OtpPasswordStep
│   ├── home/             # HomePage
│   │   └── component/    # Header, FriendList, RecentMatches, MatchModal,
│   │                     # ChatWindow, StreakCard, StreakCalendarModal,
│   │                     # NotificationDropdown, IncomingCallModal
│   ├── login/            # LoginPage, RegisterPage, AuthInput, GoogleCallbackPage
│   ├── meeting/          # MeetingPage, RemoteVideo, LocalVideo, ChatPanel
│   ├── messages/         # MessagesPage
│   │   └── component/    # FriendSidebar, ChatArea
│   ├── profile/          # ProfilePage
│   │   └── component/    # ProfileCard, ProfileForm, ChangePasswordForm, SettingsForm
│   ├── review/           # ReviewPage
│   │   └── component/    # StreakCelebration, ReportModal
│   └── waiting/          # WaitingPage (matching queue)
├── router/
│   ├── routes.tsx        # Route definitions (nested, errorElement)
│   └── ProtectedRoute.tsx # Route guard theo role
├── services/
│   ├── auth.service.ts   # Login, register, Google OAuth
│   ├── admin.service.ts  # Admin APIs (users, reports, appeals, dashboard)
│   ├── chat.service.ts   # Get messages, upload image
│   ├── notification.service.ts # Notifications
│   ├── socket.service.ts # Socket.IO singleton
│   ├── webrtc/           # WebRTC manager, media, ICE, signaling helpers
│   └── user.service.ts   # Profile, friends, matches, reports, appeal
└── theme/
    └── theme.ts          # Color tokens (lightTheme, darkTheme, AppTheme interface)
```

---

## Route Map

| Path | Page | Auth | Role |
|---|---|---|---|
| `/` | LoginPage | Public | — |
| `/login` | LoginPage | Public | — |
| `/register` | RegisterPage | Public | — |
| `/forgot-password` | ForgotPasswordPage | Public | — |
| `/auth/callback` | GoogleCallbackPage | Public | — |
| `/appeal` | AppealPage | Public | — |
| `/admin/login` | AdminLoginPage | Public | — |
| `/home` | HomePage | ✅ | user |
| `/waiting` | WaitingPage | ✅ | user |
| `/direct-call` | DirectCallPage | ✅ | user |
| `/call-ended` | CallEndedPage | ✅ | user |
| `/meeting` | MeetingPage | ✅ | user |
| `/review` | ReviewPage | ✅ | user |
| `/profile` | ProfilePage | ✅ | user |
| `/messages` | MessagesPage | ✅ | user |
| `/admin` | AdminPage | ✅ | admin |
| `*` | NotFoundPage | Public | — |

---

## Luồng chính

```
/ (Login)
  ├── Google OAuth → /auth/callback → /home
  └── Email/Password → check role → /home (user) | /admin (admin)

/home
  ├── FriendList → ChatWindow (popup) → /messages?friend=xxx
  ├── FriendList → /direct-call → /call-ended
  ├── MatchModal → /waiting → /meeting → /review → StreakCelebration → /home
  └── StreakCard → StreakCalendarModal

/admin/login → /admin (dashboard: users, reports, appeals, stats)
```

---

## Kiến trúc đáng chú ý

**Route Guard** — `ProtectedRoute` check `isAuthenticated` + `user.role`. Sai role → `logout()` + redirect về login đúng. Chưa auth → redirect về login.

**App Loader** — `AuthContext` verify token khi mount (`GET /api/users/me`). Trong lúc đó hiện `AppLoader` (logo xoay). Xong mới render router.

**Axios Interceptor** — tự gắn `Authorization: Bearer`, tự refresh token khi 401, xếp hàng request đang chờ.

**Socket Singleton** — `socketService` duy trì 1 connection, tránh duplicate khi navigate.

**WebRTC thuần** — `useWebRTC` hook: `getUserMedia` → `RTCPeerConnection` → signaling qua socket → P2P stream. Không dùng thư viện ngoài.

**WebRTC Refactor** — `useWebRTC` chỉ giữ lifecycle React/state. Core call logic nằm trong `src/services/webrtc/`:

- `webrtc-manager.ts`: quản lý `RTCPeerConnection`, local/remote streams, offer/answer, ICE queue, cleanup.
- `media.ts`: xin quyền camera/mic, fallback audio-only, bật/tắt audio/video track, stop stream.
- `peer-connection.ts`: tạo peer connection và gắn ICE/track/connection state events.
- `ice.ts`: safe add ICE candidate.
- `signaling.service.ts`: wrapper WebRTC signaling qua `socketService`.
- `reducer.ts`, `actions.ts`, `types.ts`: WebRTC UI state.

Lưu ý signaling:

- `MeetingPage` chờ đủ `user.id`, `sessionId`, `partnerId` trước khi start WebRTC.
- Caller retry cùng một offer trong thời gian ngắn cho tới khi nhận answer.
- ICE candidates được buffer cho tới khi remote description sẵn sàng.
- `socketService.connect()` phải reuse socket instance hiện có, kể cả khi socket đang connecting.
- Backend hiện có thể forward WebRTC events không kèm `sessionId`; frontend chấp nhận missing `sessionId` và chỉ reject khi payload có `sessionId` khác session hiện tại.

Backend nên cải thiện: forward `webrtc_offer`, `webrtc_answer`, `webrtc_ice_candidate` kèm `sessionId` rõ ràng, tốt nhất scope theo call room/session.

**Chat Status** — Text message qua socket (check `connected` trước, failed ngay nếu offline). Image qua API upload (sending → sent/failed).

**i18n** — Không hardcode string. Thêm ngôn ngữ: tạo `src/i18n/locales/xx.ts` implement `Translation`.

**Theme tokens** — Không hardcode màu. Tất cả qua `theme.*`. Bao gồm `overlay`, `warning`, `status`, `star`.

**learningCalendar normalize** — BE có thể trả `string[]` hoặc `Record<string,number>`. `AuthContext` normalize về `Record<string,number>` trước khi lưu.

---

## Cài đặt

```bash
npm install
npm run dev
```

### Biến môi trường

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Test LAN (WebRTC cần HTTPS):**
```bash
npm run dev -- --https
```
Máy khác truy cập `https://192.168.x.x:5173` (chấp nhận self-signed cert).

---

## Conventions

- **NO hardcoded strings** — dùng `useI18n()` → `t.section.key`
- **NO hardcoded colors** — dùng `useTheme()` → `theme.category.token`
- **Show plan trước** — lên plan + show code → chờ confirm → apply
- **Page structure** — `src/page/{kebab-case}/`, components con trong `component/`
- **API calls** — qua `useApi()` hook + service configs trong `src/services/`
- **Naming** — folder: kebab-case, component file: PascalCase, hook/service: camelCase
- **Markdown docs** — `.gitignore` ignore mọi `*.md` trừ `README.md`; các note local như `WEBRTC_REFACTOR_NOTES.md` không được track.

Chi tiết đầy đủ trong `.kiro/steering/project-conventions.md`.
