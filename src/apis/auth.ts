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
  return apiFetch<LoginOptions>("/internal/identity/login/options");
}

export async function getLoginChallenge(): Promise<LoginChallenge> {
  return apiFetch<LoginChallenge>("/internal/identity/login/challenge");
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
  return apiFetch<LoginResponse>("/internal/identity/login/password", { method: "POST", body: JSON.stringify({ employeeId, envelope }) });
}

export async function startDingTalkLogin(returnTo: string): Promise<{ redirectUrl: string }> {
  return apiFetch<{ redirectUrl: string }>(`/internal/identity/login/dingtalk/start?returnTo=${encodeURIComponent(returnTo)}`);
}
