// ─── Translation shape ───────────────────────────────────────
// Thêm ngôn ngữ mới: tạo file mới trong locales/ và implement interface này

export interface Translation {
  // Common
  common: {
    or: string;
    loading: string;
  };

  // Validation messages
  validation: {
    required: string;          // "{label} không được để trống."
    minLength: string;         // "{label} phải có ít nhất {min} ký tự."
    maxLength: string;         // "{label} không được vượt quá {max} ký tự."
    invalidEmail: string;      // "Email không đúng định dạng."
    mustMatch: string;         // "{label} không khớp."
    passwordNoUppercase: string;
    passwordNoNumber: string;
  };

  // Auth
  auth: {
    welcomeBack: string;
    login: string;
    loginSuccess: string;
    loggingIn: string;
    forgotPassword: string;
    noAccount: string;
    registerNow: string;

    createAccount: string;
    register: string;
    registering: string;
    alreadyHaveAccount: string;
    loginLink: string;
    registerSuccess: string;
    registerSuccessDesc: string;
    goToLogin: string;
    termsText: string;
    termsLink: string;
    privacyLink: string;

    emailPlaceholder: string;
    passwordPlaceholder: string;
    passwordHint: string;
    confirmPasswordLabel: string;
    googleSignIn: string;
    googleSignUp: string;

    passwordStrength: {
      weak: string;
      medium: string;
      good: string;
      strong: string;
      checks: {
        length: string;
        uppercase: string;
        number: string;
        special: string;
      };
    };
  };

  // Forgot password
  forgotPassword: {
    title: string;
    subtitle: string;
    emailLabel: string;
    sendOtp: string;
    sendingOtp: string;
    otpSent: string;
    otpLabel: string;
    otpPlaceholder: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    submit: string;
    submitting: string;
    success: string;
    successDesc: string;
    backToLogin: string;
    resendOtp: string;
    resendIn: string;
    expired: string;
  };

  // Profile
  profile: {
    title: string;
    editProfile: string;
    saveChanges: string;
    saving: string;
    saveSuccess: string;
    fullName: string;
    bio: string;
    bioPlaceholder: string;
    country: string;
    email: string;
    language: string;
    proficiencyLevel: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePassword: string;
    updatingPassword: string;
    passwordUpdateSuccess: string;
    backToHome: string;
    uploadAvatar: string;
    uploadAvatarHint: string;
    uploading: string;
  };

  // Meeting
  meeting: {
    waitingForConnection: string;
    cameraOff: string;
    connected: string;
    notConnected: string;
    you: string;
    noCameraLabel: string;

    muteMic: string;
    unmuteMic: string;
    turnOffCamera: string;
    turnOnCamera: string;
    chat: string;
    endCall: string;

    chatHeader: string;
    messagePlaceholder: string;
  };
}
