"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }







var _chunkK75HC34Mcjs = require('./chunk-K75HC34M.cjs');

// src/index.ts
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _openapiparser = require('@readme/openapi-parser'); var _openapiparser2 = _interopRequireDefault(_openapiparser);
var _postmantoopenapi = require('@readme/postman-to-openapi'); var _postmantoopenapi2 = _interopRequireDefault(_postmantoopenapi);
var _swagger2openapi = require('swagger2openapi'); var _swagger2openapi2 = _interopRequireDefault(_swagger2openapi);
var OASNormalize = class _OASNormalize {
  constructor(file, opts) {
    this.file = file;
    this.opts = {
      colorizeErrors: false,
      enablePaths: false,
      ...opts
    };
    this.type = _chunkK75HC34Mcjs.getType.call(void 0, this.file);
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
      const ret = _chunkK75HC34Mcjs.stringToJSON.call(void 0, obj);
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
        const resp = await fetch(_chunkK75HC34Mcjs.normalizeURL.call(void 0, this.file)).then((res) => res.text());
        return resolve(resp);
      case "path":
        if (!this.opts.enablePaths) {
          return Promise.reject(new Error("Use `opts.enablePaths` to enable accessing local files."));
        }
        const contents = _fs2.default.readFileSync(this.file).toString();
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
    return _postmantoopenapi2.default.call(void 0, JSON.stringify(schema), void 0, { outputFormat: "json", replaceVars: true }).then(
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
      if (_chunkK75HC34Mcjs.isPostman.call(void 0, schema)) {
        return _OASNormalize.convertPostmanToOpenAPI(schema);
      }
      return schema;
    }).then((schema) => _openapiparser2.default.bundle(schema)).then((bundle) => {
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
      if (_chunkK75HC34Mcjs.isPostman.call(void 0, schema)) {
        return _OASNormalize.convertPostmanToOpenAPI(schema);
      }
      return schema;
    }).then((schema) => _openapiparser2.default.dereference(schema)).then((dereferenced) => {
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
      if (!_chunkK75HC34Mcjs.isPostman.call(void 0, schema)) {
        return schema;
      }
      return _OASNormalize.convertPostmanToOpenAPI(schema);
    }).then(async (schema) => {
      if (!_chunkK75HC34Mcjs.isSwagger.call(void 0, schema) && !_chunkK75HC34Mcjs.isOpenAPI.call(void 0, schema)) {
        return Promise.reject(new Error("The supplied API definition is unsupported."));
      } else if (_chunkK75HC34Mcjs.isSwagger.call(void 0, schema)) {
        const baseVersion = parseInt(schema.swagger, 10);
        if (baseVersion === 1) {
          return Promise.reject(new Error("Swagger v1.2 is unsupported."));
        }
      }
      const clonedSchema = JSON.parse(JSON.stringify(schema));
      return _openapiparser2.default.validate(clonedSchema, parserOptions).then(() => {
        if (!convertToLatest || _chunkK75HC34Mcjs.isOpenAPI.call(void 0, schema)) {
          return schema;
        }
        return _swagger2openapi2.default.convertObj(schema, { anchors: true }).then((options) => options.openapi);
      }).catch((err) => Promise.reject(err));
    });
  }
  /**
   * Retrieve OpenAPI, Swagger, or Postman version information about the supplied API definition.
   *
   */
  async version() {
    return this.load().then((schema) => {
      switch (_chunkK75HC34Mcjs.getAPIDefinitionType.call(void 0, schema)) {
        case "openapi":
          return {
            specification: "openapi",
            version: schema.openapi
          };
        case "postman":
          let version = "unknown";
          if (_optionalChain([schema, 'optionalAccess', _ => _.info, 'optionalAccess', _2 => _2.schema])) {
            const match = (_optionalChain([schema, 'optionalAccess', _3 => _3.info])).schema.match(
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


exports.default = OASNormalize;

module.exports = exports.default;
//# sourceMappingURL=index.cjs.map