import { z } from 'zod';

const JWTPayloadSchema = z.object({
    sub: z.string().uuid(),
    email: z.string(),
    role: z.string(),
    iat: z.number(),
    exp: z.number(),
});

type JWTPayload = z.infer<typeof JWTPayloadSchema>;

export function decodeJWT(accessToken: string): JWTPayload | null {
    try {
        const payload = JSON.parse(
          Buffer.from(accessToken.split('.')[1], 'base64').toString()
        );
        return JWTPayloadSchema.parse(payload);
  } catch (error) { 
    return null
}
}