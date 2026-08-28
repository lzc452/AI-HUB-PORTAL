import type { SessionActor } from "@/types/common";

export type LoginMethod = "password" | "dingtalk_sso";

export interface LoginOptions {
  methods: readonly LoginMethod[];
}

export interface LoginChallenge {
  keyId: string;
  jwk: {
    kty: "RSA";
    n: string;
    e: string;
    alg: "RSA-OAEP-256";
    key_ops: readonly ["wrapKey"];
  };
  nonce: string;
  expiresAt: string;
}

export interface EncryptedLoginEnvelope {
  encryptedPayload: string;
  wrappedKey: string;
  iv: string;
  aad: string;
  keyId: string;
  nonce: string;
}

export interface LoginResponse {
  actor: SessionActor;
  session: {
    sessionId: string;
    employeeId: string;
    deviceLabel: string;
    expiresAt: string;
    revokedAt: string | null;
  };
}
