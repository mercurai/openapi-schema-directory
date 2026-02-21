import crypto from "node:crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

export const ERROR_TAXONOMY = {
  VALIDATION_ERROR: "schema validation failed",
  CONTEXT_ERROR: "missing or invalid context",
  POLICY_DENY: "action denied by policy",
  NETWORK_ERROR: "network request failed",
  UPSTREAM_ERROR: "external API returned error",
  INTERNAL_ERROR: "unexpected internal error",
} as const;

export type ErrorType = keyof typeof ERROR_TAXONOMY;

const REDACTED = "[REDACTED]";
const SECRET_FIELDS = new Set([
  "authorization",
  "authorization_header",
  "x-api-key",
  "apikey",
  "api_key",
  "token",
  "access_token",
  "refresh_token",
  "secret",
  "password",
  "cookie",
  "set-cookie",
  "x-auth-token",
  "bearer_token",
]);

function isSecretKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    SECRET_FIELDS.has(lower) ||
    lower.includes("token") ||
    lower.includes("secret") ||
    lower.includes("password") ||
    lower.includes("key") ||
    lower.includes("auth")
  );
}

export function redact<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return obj;
  if (typeof obj === "number" || typeof obj === "boolean") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redact(item)) as T;
  }

  if (typeof obj === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (isSecretKey(key)) {
        redacted[key] = REDACTED;
      } else {
        redacted[key] = redact(value);
      }
    }
    return redacted as T;
  }

  return obj;
}

function detectErrorType(err: Error): ErrorType {
  const msg = err.message.toLowerCase();

  if (msg.includes("validation") || msg.includes("invalid schema") || msg.includes("openapi")) {
    return "VALIDATION_ERROR";
  }
  if (msg.includes("not found") || msg.includes("missing")) {
    return "CONTEXT_ERROR";
  }
  if (msg.includes("denied") || msg.includes("forbidden") || msg.includes("policy")) {
    return "POLICY_DENY";
  }
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("connect") || msg.includes("econn")) {
    return "NETWORK_ERROR";
  }
  if (msg.includes("4xx") || msg.includes("5xx") || msg.includes("upstream") || msg.includes("external")) {
    return "UPSTREAM_ERROR";
  }
  return "INTERNAL_ERROR";
}

export function createTraceId(): string {
  return crypto.randomUUID();
}

export interface LogEntry {
  ts: string;
  level: LogLevel;
  event: string;
  traceId: string;
  spanId?: string;
  details?: Record<string, unknown>;
  error?: {
    type: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  private traceId: string;
  private baseDetails: Record<string, unknown>;

  constructor(traceId?: string, baseDetails: Record<string, unknown> = {}) {
    this.traceId = traceId || createTraceId();
    this.baseDetails = baseDetails;
  }

  private log(level: LogLevel, event: string, data?: { details?: Record<string, unknown>; error?: Error }): void {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      event,
      traceId: this.traceId,
      details: data?.details ? redact({ ...this.baseDetails, ...data.details }) : redact(this.baseDetails),
    };

    if (data?.error) {
      entry.error = {
        type: detectErrorType(data.error),
        message: data.error.message,
        stack: data.error.stack,
      };
    }

    console.log(JSON.stringify(entry));
  }

  debug(event: string, details?: Record<string, unknown>): void {
    this.log("debug", event, { details });
  }

  info(event: string, details?: Record<string, unknown>): void {
    this.log("info", event, { details });
  }

  warn(event: string, details?: Record<string, unknown>): void {
    this.log("warn", event, { details });
  }

  error(event: string, err: Error, details?: Record<string, unknown>): void {
    this.log("error", event, { details, error: err });
  }

  child(overrides: Partial<LogEntry>): Logger {
    return new Logger(
      overrides.traceId || this.traceId,
      { ...this.baseDetails, ...overrides.details }
    );
  }

  getTraceId(): string {
    return this.traceId;
  }
}

export const logger = new Logger();
