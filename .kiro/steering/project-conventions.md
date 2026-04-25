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

## Theme & Styling — BẮT BUỘC

- **KHÔNG BAO GIỜ** hardcode màu sắc — luôn dùng `useTheme()` để lấy token từ theme
- **KHÔNG BAO GIỜ** dùng Tailwind class màu cụ thể (vd: `text-blue-500`) — dùng `style={{ color: theme.text.primary }}`
- **KHÔNG BAO GIỜ** viết literal color (`#rrggbb`, `rgba(...)`) trực tiếp trong JSX/style — nếu cần màu mới thì thêm vào `src/theme/theme.ts` trước
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

## i18n — BẮT BUỘC

- **KHÔNG BAO GIỜ** hardcode text tiếng Việt hoặc tiếng Anh trực tiếp trong JSX
- Thêm text mới → thêm key vào `src/i18n/types.ts` trước, sau đó thêm value vào cả `vi.ts` và `en.ts`
- Dùng `useI18n()` để lấy `t` object, truy cập key theo path: `t.section.key`
- Template strings dùng `{placeholder}` — thay bằng `.replace("{placeholder}", value)` trong component

---

## Quy trình làm việc — BẮT BUỘC

Trước khi tạo hoặc sửa bất kỳ file nào, **phải** show toàn bộ code ra chat để người dùng review.

1. **Lên plan**: Mô tả những file nào sẽ thay đổi, thay đổi gì
2. **Show code đầy đủ** ra chat (dạng code block)
3. **Chờ người dùng confirm** ("ok", "được", "làm đi", "confirm", "đồng ý", "code đi"...)
4. Sau khi được confirm mới thực sự tạo/sửa file

**Áp dụng cho MỌI trường hợp:**
- Tạo page/component mới
- Fix bug
- Refactor code
- Thêm feature
- Sửa bất kỳ file nào

**Không được tự ý tạo hoặc sửa file mà không có sự đồng ý của người dùng.**

**TUYỆT ĐỐI KHÔNG được trả lời "Understood" hay bất kỳ từ tương đương.**
- Nếu yêu cầu rõ ràng → lên plan ngay và show ra
- Nếu yêu cầu chưa rõ → hỏi lại cụ thể bằng câu hỏi ngắn gọn
- Nếu đang chờ confirm → nói rõ "Đang chờ bạn confirm để apply"

| Loại | Convention | Ví dụ |
|---|---|---|
| Folder page | kebab-case | `friend-list/` |
| File component | PascalCase | `FriendCard.tsx` |
| File hook | camelCase với prefix `use` | `useFriendList.ts` |
| File service | camelCase với suffix `.service` | `friend.service.ts` |
| Route path | kebab-case | `/friend-list` |
