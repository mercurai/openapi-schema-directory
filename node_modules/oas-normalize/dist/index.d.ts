import { Options } from './lib/types.js';
import { OpenAPI } from 'openapi-types';
import openapiParser from '@readme/openapi-parser';
import { getType } from './lib/utils.js';

declare class OASNormalize {
    cache: {
        bundle?: OpenAPI.Document | false;
        deref?: OpenAPI.Document | false;
        load?: Record<string, unknown> | false;
    };
    file: any;
    opts: Options;
    type: ReturnType<typeof getType>;
    constructor(file: any, opts?: Options);
    /**
     * @private
     */
    load(): Promise<Record<string, unknown>>;
    /**
     * @private
     */
    static convertPostmanToOpenAPI(schema: any): Promise<any>;
    /**
     * Bundle up the given API definition, resolving any external `$ref` pointers in the process.
     *
     */
    bundle(): Promise<OpenAPI.Document<{}>>;
    /**
     * Dereference the given API definition.
     *
     */
    deref(): Promise<OpenAPI.Document<{}>>;
    /**
     * Validate, and potentially convert to OpenAPI, a given API definition.
     *
     */
    validate(opts?: {
        /**
         * Automatically convert the supplied API definition to the latest version of OpenAPI.
         */
        convertToLatest?: boolean;
        parser?: openapiParser.Options;
    }): Promise<OpenAPI.Document>;
    /**
     * Retrieve OpenAPI, Swagger, or Postman version information about the supplied API definition.
     *
     */
    version(): Promise<{
        specification: 'openapi' | 'postman' | 'swagger';
        version: string | 'unknown';
    }>;
}

export { OASNormalize as default };
