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
    termsAnd: string;

    emailPlaceholder: string;
    passwordPlaceholder: string;
    passwordHint: string;
    confirmPasswordLabel: string;
    passwordLabel: string;
    googleSignIn: string;
    googleSignUp: string;

    fullNameLabel: string;
    fullNamePlaceholder: string;
    countryLabel: string;
    countryPlaceholder: string;

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
    generalSettings: string;
    editProfileLabel: string;
    logoutLabel: string;
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
    sendRequest: string;
    unfriend: string;
    unfriendConfirm: string;
    unfriendYes: string;
    unfriendNo: string;
    streak: string;
    streakDays: string;
    totalHours: string;
    totalSessions: string;
    daysThisMonth: string;
    findPartner: string;
    chooseLanguageHint: string;
    searchFriends: string;
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

  // Chat window
  chat: {
    typeMessage: string;
    sendImage: string;
    noMessages: string;
    you: string;
    call: string;
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

  // Review page
  review: {
    title: string;
    subtitle: string;
    overallLabel: string;
    commentLabel: string;
    commentPlaceholder: string;
    submit: string;
    skip: string;
    successTitle: string;
    successDesc: string;
    backHome: string;
    errorSubmit: string;
  };

  // Streak celebration
  streak: {
    title: string;
    subtitle: string;
    days: string;
    continue: string;
    great: string;
    dayLabels: string[];
  };

  // Waiting page
  waiting: {
    title: string;
    subtitle: string;
    tip: string;
    cancel: string;
    elapsed: string;
    timeout: string;
    matched: string;
    retry: string;
  };

  // Streak calendar modal
  streakCalendar: {
    title: string;
    close: string;
    monthNames: string[];
    dayLabels: string[];
  };

  // Incoming call modal
  incomingCall: {
    incoming: string;
    accept: string;
    reject: string;
    rejected: string;
  };

  // Call ended page
  callEnded: {
    ended: string;
    backHome: string;
  };

  // Appeal page
  appeal: {
    title: string;
    subtitle: string;
    invalidToken: string;
    invalidTokenDesc: string;
    reasonLabel: string;
    reasonPlaceholder: string;
    reasonHint: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    backToLogin: string;
    errorGeneric: string;
  };

  // Report
  report: {
    title: string;
    subtitle: string;
    reasonLabel: string;
    reasons: {
      spam: string;
      harassment: string;
      inappropriate: string;
      hate: string;
      other: string;
    };
    submit: string;
    submitting: string;
    cancel: string;
    success: string;
    error: string;
    button: string;
  };

  // Messages page
  messages: {
    title: string;
    searchFriends: string;
    noFriendSelected: string;
    selectFriendHint: string;
    detail: string;
    backToHome: string;
    online: string;
    offline: string;
    noFriends: string;
  };

  // Admin
  admin: {
    title: string;
    subtitle: string;
    backToHome: string;
    usersSection: string;
    reportsSection: string;
    appealsSection: string;
    dashboardSection: string;
    stats: {
      totalUsers: string;
      active: string;
      banned: string;
      pendingReports: string;
      online: string;
      newToday: string;
      totalSessions: string;
      totalMessages: string;
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
      resolveTitle: string;
      adminNotes: string;
      adminNotesPlaceholder: string;
      banUser: string;
      banDuration: string;
      noBan: string;
      ban3days: string;
      ban7days: string;
      ban30days: string;
      banPermanent: string;
      confirm: string;
      cancel: string;
    };
    appeals: {
      all: string;
      pending: string;
      approved: string;
      rejected: string;
      noAppeals: string;
      approve: string;
      reject: string;
      adminNotes: string;
      adminNotesPlaceholder: string;
      user: string;
      banReason: string;
      appealContent: string;
      processing: string;
    };
    logout: string;
  };
}
