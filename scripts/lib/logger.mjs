import crypto from "node:crypto";

/**
 * @typedef {'debug' | 'info' | 'warn' | 'error'} LogLevel
 */

/** @type {Record<string, string>} */
export const ERROR_TAXONOMY = {
  VALIDATION_ERROR: "schema validation failed",
  CONTEXT_ERROR: "missing or invalid context",
  POLICY_DENY: "action denied by policy",
  NETWORK_ERROR: "network request failed",
  UPSTREAM_ERROR: "external API returned error",
  INTERNAL_ERROR: "unexpected internal error",
};

/** @typedef {keyof typeof ERROR_TAXONOMY} ErrorType */

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

/**
 * @param {string} key
 * @returns {boolean}
 */
function isSecretKey(key) {
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

/**
 * @template T
 * @param {T} obj
 * @returns {T}
 */
export function redact(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return obj;
  if (typeof obj === "number" || typeof obj === "boolean") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redact(item));
  }

  if (typeof obj === "object") {
    const redacted = {};
    for (const [key, value] of Object.entries(obj)) {
      if (isSecretKey(key)) {
        redacted[key] = REDACTED;
      } else {
        redacted[key] = redact(value);
      }
    }
    return redacted;
  }

  return obj;
}

/**
 * @param {Error} err
 * @returns {ErrorType}
 */
function detectErrorType(err) {
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

/**
 * @returns {string}
 */
export function createTraceId() {
  return crypto.randomUUID();
}

/**
 * @typedef {Object} LogEntry
 * @property {string} ts
 * @property {LogLevel} level
 * @property {string} event
 * @property {string} traceId
 * @property {string} [spanId]
 * @property {Record<string, unknown>} [details]
 * @property {Object} [error]
 * @property {string} error.type
 * @property {string} error.message
 * @property {string} [error.stack]
 */

/**
 * @typedef {Object} LoggerOptions
 * @property {string} [traceId]
 * @property {Record<string, unknown>} [baseDetails]
 */

/** @type {typeof import('../../openclaw-openapi-tool-bridge/src/lib/logger').Logger} */
export class Logger {
  /**
   * @param {string} [traceId]
   * @param {Record<string, unknown>} [baseDetails]
   */
  constructor(traceId, baseDetails = {}) {
    this.traceId = traceId || createTraceId();
    this.baseDetails = baseDetails;
  }

  /**
   * @param {LogLevel} level
   * @param {string} event
   * @param {{details?: Record<string, unknown>, error?: Error}} [data]
   */
  log(level, event, data) {
    /** @type {LogEntry} */
    const entry = {
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

  /**
   * @param {string} event
   * @param {Record<string, unknown>} [details]
   */
  debug(event, details) {
    this.log("debug", event, { details });
  }

  /**
   * @param {string} event
   * @param {Record<string, unknown>} [details]
   */
  info(event, details) {
    this.log("info", event, { details });
  }

  /**
   * @param {string} event
   * @param {Record<string, unknown>} [details]
   */
  warn(event, details) {
    this.log("warn", event, { details });
  }

  /**
   * @param {string} event
   * @param {Error} err
   * @param {Record<string, unknown>} [details]
   */
  error(event, err, details) {
    this.log("error", event, { details, error: err });
  }

  /**
   * @param {Partial<LogEntry>} overrides
   * @returns {Logger}
   */
  child(overrides) {
    return new Logger(
      overrides.traceId || this.traceId,
      { ...this.baseDetails, ...overrides.details }
    );
  }

  /** @returns {string} */
  getTraceId() {
    return this.traceId;
  }
}

// Default logger instance
export const logger = new Logger();
