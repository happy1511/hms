// src/services/jwt.service.ts
import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = "15m";
const JWT_REFRESH_EXPIRES_IN: SignOptions["expiresIn"] = "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  loginId: string;
  role?: string;
}

/**
 * 🔑 Sign Access Token
 */
export function signAccessToken(
  payload: AccessTokenPayload,
  options?: SignOptions
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  });
}

/**
 * 🔁 Sign Refresh Token
 */
export function signRefreshToken(
  payload: Pick<AccessTokenPayload, "userId">
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * ✅ Verify Token
 */
export function verifyToken<T = JwtPayload>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}

/**
 * 🔍 Decode Token (no verification)
 */
export function decodeToken<T = JwtPayload>(token: string): T | null {
  return jwt.decode(token) as T | null;
}
