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
    passwordLabel: string;
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
    updateAvatar: string;
    cancel: string;
    errorImageOnly: string;
    errorFileTooLarge: string;
    errorUploadFailed: string;
    settings: {
      appearance: string;
      light: string;
      dark: string;
      defaultLanguage: string;
      save: string;
      saving: string;
      saved: string;
    };
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
    cameraOffLocal: string;
    permissionDenied: string;
    permissionUnavailable: string;
  };

  // Home
  home: {
    friends: string;
    allFilter: string;
    onlineFilter: string;
    onlineCount: string;
    loading: string;
    noFriendsOnline: string;
    noFriendsYet: string;
    notifications: string;
    newBadge: string;
    loadingNotifications: string;
    noNotifications: string;
    accept: string;
    reject: string;
    accepted: string;
    rejected: string;
    markAllRead: string;
    matchModal: {
      title: string;
      subtitle: string;
      start: string;
      cancel: string;
    };
  };

  // Friend status labels
  friendStatus: {
    online: string;
    busy: string;
    away: string;
    offline: string;
  };

  // Direct call waiting
  directCall: {
    calling: string;
    waitingResponse: string;
    cancel: string;
    rejected: string;
    error: string;
    timeout: string;
    backToHome: string;
  };

  // Admin
  admin: {
    title: string;
    subtitle: string;
    backToHome: string;
    usersSection: string;
    reportsSection: string;
    stats: {
      totalUsers: string;
      active: string;
      banned: string;
      pendingReports: string;
    };
    table: {
      user: string;
      email: string;
      role: string;
      status: string;
      joined: string;
      actions: string;
      noUsers: string;
      searchPlaceholder: string;
      ban: string;
      delete: string;
    };
    deleteDialog: {
      title: string;
      description: string;
      confirm: string;
      cancel: string;
    };
    reports: {
      all: string;
      pending: string;
      resolved: string;
      dismissed: string;
      noReports: string;
      reporter: string;
      reportedUser: string;
      description: string;
      dismiss: string;
      markResolved: string;
    };
  };
}
