import {
  getAPIDefinitionType,
  getType,
  isOpenAPI,
  isPostman,
  isSwagger,
  normalizeURL,
  stringToJSON
} from "./chunk-XOS5M44Y.js";

// src/index.ts
import fs from "node:fs";
import openapiParser from "@readme/openapi-parser";
import postmanToOpenAPI from "@readme/postman-to-openapi";
import converter from "swagger2openapi";
var OASNormalize = class _OASNormalize {
  constructor(file, opts) {
    this.file = file;
    this.opts = {
      colorizeErrors: false,
      enablePaths: false,
      ...opts
    };
    this.type = getType(this.file);
    this.cache = {
      load: false,
      bundle: false,
      deref: false
    };
  }
  /**
   * @private
   */
  async load() {
    if (this.cache.load) return Promise.resolve(this.cache.load);
    const resolve = (obj) => {
      const ret = stringToJSON(obj);
      this.cache.load = ret;
      return Promise.resolve(ret);
    };
    switch (this.type) {
      case "json":
      case "string-json":
      case "string-yaml":
        return resolve(this.file);
      case "buffer":
        return resolve(this.file.toString());
      case "url":
        const resp = await fetch(normalizeURL(this.file)).then((res) => res.text());
        return resolve(resp);
      case "path":
        if (!this.opts.enablePaths) {
          return Promise.reject(new Error("Use `opts.enablePaths` to enable accessing local files."));
        }
        const contents = fs.readFileSync(this.file).toString();
        if (!contents.trim()) {
          return Promise.reject(new Error("No file contents found."));
        }
        return resolve(contents);
      default:
        return Promise.reject(new Error("Could not load this file."));
    }
  }
  /**
   * @private
   */
  static async convertPostmanToOpenAPI(schema) {
    return postmanToOpenAPI(JSON.stringify(schema), void 0, { outputFormat: "json", replaceVars: true }).then(
      JSON.parse
    );
  }
  /**
   * Bundle up the given API definition, resolving any external `$ref` pointers in the process.
   *
   */
  async bundle() {
    if (this.cache.bundle) return Promise.resolve(this.cache.bundle);
    return this.load().then((schema) => {
      if (isPostman(schema)) {
        return _OASNormalize.convertPostmanToOpenAPI(schema);
      }
      return schema;
    }).then((schema) => openapiParser.bundle(schema)).then((bundle) => {
      this.cache.bundle = bundle;
      return bundle;
    });
  }
  /**
   * Dereference the given API definition.
   *
   */
  async deref() {
    if (this.cache.deref) return Promise.resolve(this.cache.deref);
    return this.load().then((schema) => {
      if (isPostman(schema)) {
        return _OASNormalize.convertPostmanToOpenAPI(schema);
      }
      return schema;
    }).then((schema) => openapiParser.dereference(schema)).then((dereferenced) => {
      this.cache.deref = dereferenced;
      return dereferenced;
    });
  }
  /**
   * Validate, and potentially convert to OpenAPI, a given API definition.
   *
   */
  async validate(opts = { convertToLatest: false }) {
    const convertToLatest = opts.convertToLatest;
    const parserOptions = opts.parser || {};
    if (!parserOptions.validate) {
      parserOptions.validate = {};
    }
    parserOptions.validate.colorizeErrors = this.opts.colorizeErrors;
    return this.load().then(async (schema) => {
      if (!isPostman(schema)) {
        return schema;
      }
      return _OASNormalize.convertPostmanToOpenAPI(schema);
    }).then(async (schema) => {
      if (!isSwagger(schema) && !isOpenAPI(schema)) {
        return Promise.reject(new Error("The supplied API definition is unsupported."));
      } else if (isSwagger(schema)) {
        const baseVersion = parseInt(schema.swagger, 10);
        if (baseVersion === 1) {
          return Promise.reject(new Error("Swagger v1.2 is unsupported."));
        }
      }
      const clonedSchema = JSON.parse(JSON.stringify(schema));
      return openapiParser.validate(clonedSchema, parserOptions).then(() => {
        if (!convertToLatest || isOpenAPI(schema)) {
          return schema;
        }
        return converter.convertObj(schema, { anchors: true }).then((options) => options.openapi);
      }).catch((err) => Promise.reject(err));
    });
  }
  /**
   * Retrieve OpenAPI, Swagger, or Postman version information about the supplied API definition.
   *
   */
  async version() {
    return this.load().then((schema) => {
      switch (getAPIDefinitionType(schema)) {
        case "openapi":
          return {
            specification: "openapi",
            version: schema.openapi
          };
        case "postman":
          let version = "unknown";
          if (schema?.info?.schema) {
            const match = (schema?.info).schema.match(
              /http(s?):\/\/schema.getpostman.com\/json\/collection\/v([0-9.]+)\//
            );
            if (match) {
              version = match[2];
            }
          }
          return {
            specification: "postman",
            version
          };
        case "swagger":
          return {
            specification: "swagger",
            version: schema.swagger
          };
        default:
          throw new Error("Unknown file detected.");
      }
    });
  }
};
export {
  OASNormalize as default
};
//# sourceMappingURL=index.js.map