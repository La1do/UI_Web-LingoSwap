import type { Translation } from "../types";

export const vi: Translation = {
  common: {
    or: "hoặc",
    loading: "Đang xử lý…",
  },

  validation: {
    required: "{label} không được để trống.",
    minLength: "{label} phải có ít nhất {min} ký tự.",
    maxLength: "{label} không được vượt quá {max} ký tự.",
    invalidEmail: "Email không đúng định dạng.",
    mustMatch: "{label} không khớp.",
    passwordNoUppercase: "Mật khẩu phải có ít nhất 1 chữ hoa.",
    passwordNoNumber: "Mật khẩu phải có ít nhất 1 chữ số.",
  },

  auth: {
    welcomeBack: "Chào mừng trở lại",
    login: "Đăng nhập",
    loginSuccess: "Đăng nhập thành công!",
    loggingIn: "Đang xử lý…",
    forgotPassword: "Quên mật khẩu?",
    noAccount: "Chưa có tài khoản?",
    registerNow: "Đăng ký ngay",

    createAccount: "Tạo tài khoản",
    register: "Đăng ký",
    registering: "Đang tạo tài khoản…",
    alreadyHaveAccount: "Đã có tài khoản?",
    loginLink: "Đăng nhập",
    registerSuccess: "Đăng ký thành công!",
    registerSuccessDesc: "Tài khoản của bạn đã được tạo. Hãy kiểm tra email để xác minh.",
    goToLogin: "Đến trang đăng nhập →",
    termsText: "Bằng cách đăng ký, bạn đồng ý với",
    termsLink: "Điều khoản dịch vụ",
    privacyLink: "Chính sách bảo mật",

    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
    passwordHint: "Ít nhất 8 ký tự, 1 chữ hoa, 1 số",
    confirmPasswordLabel: "Xác nhận mật khẩu",
    googleSignIn: "Đăng nhập bằng Google",
    googleSignUp: "Đăng ký bằng Google",

    passwordStrength: {
      weak: "Yếu",
      medium: "Trung bình",
      good: "Tốt",
      strong: "Mạnh",
      checks: {
        length: "8+ ký tự",
        uppercase: "Chữ hoa",
        number: "Số",
        special: "Ký tự đặc biệt",
      },
    },
  },

  meeting: {
    waitingForConnection: "Đang chờ kết nối...",
    cameraOff: "đã tắt camera",
    connected: "Đã kết nối",
    notConnected: "Chưa kết nối",
    you: "Bạn",
    noCameraLabel: "Không có camera",

    muteMic: "Tắt mic",
    unmuteMic: "Bật mic",
    turnOffCamera: "Tắt camera",
    turnOnCamera: "Bật camera",
    chat: "Chat",
    endCall: "Kết thúc",

    chatHeader: "Chat",
    messagePlaceholder: "Nhập tin nhắn...",
  },
};
