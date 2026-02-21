// src/lib/utils.ts
import YAML, { JSON_SCHEMA } from "js-yaml";
function isBuffer(obj) {
  return obj != null && obj.constructor != null && typeof obj.constructor.isBuffer === "function" && !!obj.constructor.isBuffer(obj);
}
function normalizeURL(url) {
  if (url.startsWith("https://github.com/") && url.includes("/blob/")) {
    return url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
  }
  return url;
}
function getType(obj) {
  if (isBuffer(obj)) {
    return "buffer";
  } else if (typeof obj === "object") {
    return "json";
  } else if (typeof obj === "string") {
    if (obj.match(/\s*{/)) {
      return "string-json";
    } else if (obj.match(/\n/)) {
      return "string-yaml";
    } else if (obj.substring(0, 4) === "http") {
      return "url";
    }
    return "path";
  }
  return false;
}
function isOpenAPI(schema) {
  return !!schema.openapi;
}
function isPostman(schema) {
  return !!schema.info && !!schema.item;
}
function isSwagger(schema) {
  return !!schema.swagger;
}
function stringToJSON(string) {
  if (typeof string === "object") {
    return string;
  } else if (string.match(/^\s*{/)) {
    return JSON.parse(string);
  }
  return YAML.load(string, { schema: JSON_SCHEMA });
}
function isAPIDefinition(schema) {
  return isOpenAPI(schema) || isPostman(schema) || isSwagger(schema);
}
function getAPIDefinitionType(schema) {
  if (isOpenAPI(schema)) {
    return "openapi";
  } else if (isPostman(schema)) {
    return "postman";
  } else if (isSwagger(schema)) {
    return "swagger";
  }
  return "unknown";
}

export {
  isBuffer,
  normalizeURL,
  getType,
  isOpenAPI,
  isPostman,
  isSwagger,
  stringToJSON,
  isAPIDefinition,
  getAPIDefinitionType
};
//# sourceMappingURL=chunk-XOS5M44Y.js.map