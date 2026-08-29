import type { EncryptedLoginEnvelope, LoginChallenge, LoginOptions, LoginResponse } from "@/types";
import { apiFetch, getCurrentActor, useFixtures } from "@/apis/common";

function base64urlFromBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlFromBytes(bytes: Uint8Array): string {
  return base64urlFromBuffer(bytes.slice().buffer as ArrayBuffer);
}

export async function getLoginOptions(): Promise<LoginOptions> {
  if (useFixtures) return { methods: ["password"] };
  // 身份类端点：401 表示当前会话不可用，不应触发“会话失效”弹窗（弹窗本身已打开）。
  return apiFetch<LoginOptions>("/internal/identity/login/options", {}, { announceUnauthorized: false });
}

export async function getLoginChallenge(): Promise<LoginChallenge> {
  // 身份类端点：401 由登录表单错误提示呈现，不派发“会话失效”事件（避免覆盖弹窗的 returnTo/onSuccess）。
  return apiFetch<LoginChallenge>("/internal/identity/login/challenge", {}, { announceUnauthorized: false });
}

export async function buildLoginEnvelope(employeeId: string, password: string, challenge: LoginChallenge): Promise<EncryptedLoginEnvelope> {
  const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const rsaKey = await crypto.subtle.importKey("jwk", challenge.jwk as unknown as JsonWebKey, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["wrapKey"]);
  const aadHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(challenge.keyId + challenge.nonce));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = JSON.stringify({ employeeId, password, deviceLabel: "browser" });
  const encryptedPayload = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new Uint8Array(aadHash) }, aesKey, new TextEncoder().encode(payload));
  const wrappedKey = await crypto.subtle.wrapKey("raw", aesKey, rsaKey, { name: "RSA-OAEP" });
  return {
    encryptedPayload: base64urlFromBuffer(encryptedPayload),
    wrappedKey: base64urlFromBuffer(wrappedKey),
    iv: base64urlFromBytes(iv),
    aad: base64urlFromBuffer(aadHash),
    keyId: challenge.keyId,
    nonce: challenge.nonce,
  };
}

export async function loginWithPassword(employeeId: string, password: string): Promise<LoginResponse> {
  if (useFixtures) return { actor: await getCurrentActor(), session: { sessionId: "fixture-session", employeeId, deviceLabel: "browser", expiresAt: new Date(Date.now() + 86_400_000).toISOString(), revokedAt: null } };
  const challenge = await getLoginChallenge();
  const envelope = await buildLoginEnvelope(employeeId, password, challenge);
  // 登录 401=凭证错误，由弹窗表单错误提示呈现；派发“会话失效”事件会覆盖弹窗的
  // returnTo/onSuccess（登录成功后继续被拦截动作），故不派发。
  return apiFetch<LoginResponse>("/internal/identity/login/password", { method: "POST", body: JSON.stringify({ employeeId, envelope }) }, { announceUnauthorized: false });
}

export async function startDingTalkLogin(returnTo: string): Promise<{ redirectUrl: string }> {
  // 登录流程端点：401 由弹窗错误提示呈现，不派发“会话失效”事件。
  return apiFetch<{ redirectUrl: string }>(`/internal/identity/login/dingtalk/start?returnTo=${encodeURIComponent(returnTo)}`, {}, { announceUnauthorized: false });
}

/** DingTalk OAuth 回调必须先回到 Portal，才能消费同源 HttpOnly handoff cookie；回调由全局登录弹窗处理。 */
export function createDingTalkCallbackPath(returnTo: string): string {
  return `/?${new URLSearchParams({ dingtalk: "complete", returnTo }).toString()}`;
}

/** OAuth 回调已写入 HttpOnly handoff cookie；用它换取正式 Portal 会话。 */
export async function completeDingTalkLogin(): Promise<LoginResponse> {
  // 登录流程端点：handoff 失效的 401 由弹窗错误提示呈现，不派发“会话失效”事件。
  return apiFetch<LoginResponse>("/internal/identity/login/dingtalk/complete", { method: "POST" }, { announceUnauthorized: false });
}
