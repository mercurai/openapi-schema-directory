/**
 * Determine if a given variable is a `Buffer`.
 *
 */
declare function isBuffer(obj: any): boolean;
/**
 * Converts GitHub blob URLs to raw URLs
 */
declare function normalizeURL(url: string): string;
/**
 * Determine the type of a given variable. Returns `false` if unrecognized.
 *
 */
declare function getType(obj: any): false | "buffer" | "json" | "string-json" | "string-yaml" | "url" | "path";
/**
 * Determine if a given schema if an OpenAPI definition.
 *
 */
declare function isOpenAPI(schema: Record<string, unknown>): boolean;
/**
 * Determine if a given schema is a Postman collection.
 *
 * Unfortunately the Postman schema spec doesn't have anything like `openapi` or `swagger` for us
 * to look at but it does require that `info` and `item` be present and as `item` doesn't exist in
 * OpenAPI or Swagger we can use the combination of those two properties to determine if what we
 * have is a Postman collection.
 *
 * @see {@link https://schema.postman.com/json/collection/v2.0.0/collection.json}
 * @see {@link https://schema.postman.com/json/collection/v2.1.0/collection.json}
 */
declare function isPostman(schema: Record<string, unknown>): boolean;
/**
 * Determine if a given schema if an Swagger definition.
 *
 */
declare function isSwagger(schema: Record<string, unknown>): boolean;
/**
 * Convert a YAML blob or stringified JSON object into a JSON object.
 *
 */
declare function stringToJSON(string: Record<string, unknown> | string): Record<string, unknown>;
/**
 * Determine if a given schema is an API definition that we can support.
 *
 */
declare function isAPIDefinition(schema: Record<string, unknown>): boolean;
/**
 * Retrieve the type of API definition that a given schema is.
 *
 */
declare function getAPIDefinitionType(schema: Record<string, unknown>): "openapi" | "postman" | "swagger" | "unknown";

export { getAPIDefinitionType, getType, isAPIDefinition, isBuffer, isOpenAPI, isPostman, isSwagger, normalizeURL, stringToJSON };
