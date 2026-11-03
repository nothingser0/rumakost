import "server-only";

export type AuthEmail = {
  email: string;
  name: string;
  url: string;
};

export type AuthEmailSender = {
  sendVerification(message: AuthEmail): Promise<void>;
  sendPasswordReset(message: AuthEmail): Promise<void>;
};

export const authEmailSender: AuthEmailSender = {
  async sendVerification() {
    throw new Error("AUTH_EMAIL_DELIVERY_NOT_CONFIGURED");
  },
  async sendPasswordReset() {
    throw new Error("AUTH_EMAIL_DELIVERY_NOT_CONFIGURED");
  },
};
