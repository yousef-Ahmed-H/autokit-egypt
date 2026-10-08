/** حالة نموذج الدخول للوحة التحكم — ملف آمن للعميل (بدون "use server"). */
export interface LoginState {
  error?: string;
  need2fa?: boolean;
  email?: string;
}

export const initialLoginState: LoginState = {};