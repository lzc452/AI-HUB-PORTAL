import { create } from "zustand";

/** 一次登录弹窗请求：登录成功后执行 onSuccess，并在提供 returnTo 时跳转回原页面。 */
export interface LoginDialogRequest {
  /** 登录成功后跳转的站内路径；缺省时停留在当前页面。 */
  returnTo?: string;
  /** 登录成功后执行的业务动作（如补发收藏/评论请求）。 */
  onSuccess?: () => void;
  /** 钉钉 OAuth 回调：URL 携带 dingtalk=complete，弹窗打开后自动完成会话。 */
  dingTalkComplete: boolean;
}

interface LoginDialogState {
  request: LoginDialogRequest | null;
  openLoginDialog: (request?: Partial<LoginDialogRequest>) => void;
  closeLoginDialog: () => void;
}

export const useLoginDialogStore = create<LoginDialogState>()((set) => ({
  request: null,
  openLoginDialog: (request) => set({ request: { dingTalkComplete: false, ...request } }),
  closeLoginDialog: () => set({ request: null }),
}));
