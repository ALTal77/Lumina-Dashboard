const { verifyToken } = require("../utils/jwt");

function getTokenFromHeader(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7);
}

// Requires a valid token. Attaches req.user = { sub, role, name, email }.
function authenticate(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

// Attaches req.user if a valid token is present, but never blocks the request.
// Used on public endpoints (like booking) that behave slightly differently
// for a logged-in patient vs. a guest.
function optionalAuthenticate(req, res, next) {
  const token = getTokenFromHeader(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Ignore invalid/expired tokens on optional routes - treat as a guest.
    }
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action" });
    }
    next();
  };
}

module.exports = { authenticate, optionalAuthenticate, requireRole };
