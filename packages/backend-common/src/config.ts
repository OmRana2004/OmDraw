if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not found");
}

export const JWT_SECRET = process.env.JWT_SECRET;