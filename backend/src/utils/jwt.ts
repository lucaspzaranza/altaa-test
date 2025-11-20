import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-in-prod";
const JWT_EXPIRES = "7d";

export function signSession(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifySession(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}
