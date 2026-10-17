import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const isUserPayload = (decoded: unknown): decoded is JwtPayload =>
  typeof decoded === "object" &&
  decoded !== null &&
  "id" in decoded &&
  typeof decoded.id === "string";

const authenticateToken: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const [scheme, token] = header?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ["HS256"] }, (err, decoded) => {
    if (err) {
      const message = err instanceof jwt.TokenExpiredError ? "Token expired" : "Token is invalid";
      res.status(401).json({ message });
      return;
    }
    if (!isUserPayload(decoded)) {
      res.status(401).json({ message: "Token is invalid" });
      return;
    }
    req.user = { id: decoded.id };
    next();
  });
};

export default authenticateToken;
