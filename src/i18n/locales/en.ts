import type { Translation } from "../types";

export const en: Translation = {
  common: {
    or: "or",
    loading: "Processing…",
  },

  auth: {
    welcomeBack: "Welcome back",
    login: "Sign in",
    loginSuccess: "Signed in successfully!",
    loggingIn: "Signing in…",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    registerNow: "Sign up",

    createAccount: "Create account",
    register: "Sign up",
    registering: "Creating account…",
    alreadyHaveAccount: "Already have an account?",
    loginLink: "Sign in",
    registerSuccess: "Account created!",
    registerSuccessDesc: "Your account has been created. Please check your email to verify.",
    goToLogin: "Go to sign in →",
    termsText: "By signing up, you agree to our",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",

    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
    passwordHint: "At least 8 characters, 1 uppercase, 1 number",
    confirmPasswordLabel: "Confirm password",

    passwordStrength: {
      weak: "Weak",
      medium: "Medium",
      good: "Good",
      strong: "Strong",
      checks: {
        length: "8+ chars",
        uppercase: "Uppercase",
        number: "Number",
        special: "Special char",
      },
    },
  },

  meeting: {
    waitingForConnection: "Waiting for connection...",
    cameraOff: "turned off camera",
    connected: "Connected",
    notConnected: "Not connected",
    you: "You",
    noCameraLabel: "No camera",

    muteMic: "Mute",
    unmuteMic: "Unmute",
    turnOffCamera: "Stop video",
    turnOnCamera: "Start video",
    chat: "Chat",
    endCall: "End call",

    chatHeader: "Chat",
    messagePlaceholder: "Type a message...",
  },
};
