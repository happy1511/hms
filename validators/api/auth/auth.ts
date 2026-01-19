import { z } from "zod";

const authValidator = z.object({
  loginId: z.string().min(1, "Login ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const refreshTokenValidator = z.object({
  refreshToken: z.string().min(1, "Refresh Token is required"),
  redirectUrl: z.string().url("Invalid redirect URL").optional(),
});

type AuthValidatorType = z.infer<typeof authValidator>;
type RefreshTokenValidatorType = z.infer<typeof refreshTokenValidator>;

export { authValidator, refreshTokenValidator };
export type { AuthValidatorType, RefreshTokenValidatorType };
