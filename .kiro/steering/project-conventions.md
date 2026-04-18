# LingoSwap — Project Conventions

Đây là các quy tắc bắt buộc khi làm việc với project này. Đọc kỹ trước khi bắt đầu bất kỳ tác vụ nào.

---

## Cấu trúc thư mục

### Tạo page mới
- Mỗi page **phải** có folder riêng trong `src/page/` đặt tên **viết thường, kebab-case**
- Ví dụ: `src/page/profile/`, `src/page/settings/`, `src/page/friend-list/`
- File page chính đặt tên **PascalCase** theo tên folder: `ProfilePage.tsx`, `SettingsPage.tsx`
- Các component con của page đặt trong chính bên trong folder page đó
- Ví dụ: `src/page/profile/component/AvatarUpload.tsx`

### Shared components
- Component dùng chung nhiều page → `src/page/component/`
- Context → `src/context/`
- Custom hooks → `src/hook/`
- API services → `src/services/`
- Validation, axios → `src/library/`
- i18n types + locales → `src/i18n/`

---

## Quy tắc component

- Mỗi component **một file riêng**, không gộp nhiều component không liên quan vào 1 file
- Tên file và tên component phải khớp nhau (PascalCase)
- Không hardcode string UI — dùng `useI18n()` và thêm key vào `src/i18n/types.ts` + các locale

---

## Theme & Styling

- Không hardcode màu sắc — luôn dùng `useTheme()` để lấy token từ theme
- Không dùng Tailwind class màu cụ thể (vd: `text-blue-500`) — dùng `style={{ color: theme.text.primary }}`
- Mọi page mới phải wrap bằng `<PageShell>` và chỉ định `controlsPosition` phù hợp

---

## Route

- Sau khi tạo page mới, **bắt buộc** thêm route vào `src/router/routes.tsx`
- Path dùng kebab-case: `/friend-list`, `/user-profile`

---

## API

- Mọi API call đi qua `src/library/axios.customize.ts` (instance đã có interceptor)
- Định nghĩa request/response type và config trong `src/services/` tương ứng
- Dùng `useApi()` hook để gọi API trong component

---

## i18n

- Thêm text mới → thêm key vào `src/i18n/types.ts` trước, sau đó thêm value vào cả `vi.ts` và `en.ts`
- Không bao giờ hardcode text tiếng Việt hoặc tiếng Anh trực tiếp trong JSX

---

## Naming

| Loại | Convention | Ví dụ |
|---|---|---|
| Folder page | kebab-case | `friend-list/` |
| File component | PascalCase | `FriendCard.tsx` |
| File hook | camelCase với prefix `use` | `useFriendList.ts` |
| File service | camelCase với suffix `.service` | `friend.service.ts` |
| Route path | kebab-case | `/friend-list` |
