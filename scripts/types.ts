/**
 * Type definitions for APIs.guru index responses
 */

// APIs.guru entry structure
export interface ApisGuruEntry {
  id: string;
  title: string;
  description?: string;
  updated?: string;
  preferredVersion?: string;
  versions: Record<string, ApisGuruVersion>;
}

export interface ApisGuruVersion {
  openapiUrl?: string;
  swaggerUrl?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
}

// API version metadata
export interface VersionMeta {
  openapiUrl?: string;
  swaggerUrl?: string;
  info?: {
    title?: string;
    version?: string;
  };
}

// OpenAPI normalized schema
export interface OpenAPISchema {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  servers?: Array<{ url: string }>;
}

// Catalog index entry
export interface CatalogEntry {
  id: string;
  title: string;
  version: string;
  openapi: string;
  schemaPath: string;
  sourceUrl?: string;
  contentHash?: string;
  lastFetchedAt?: string;
  status?: 'fresh' | 'stale' | 'dead' | 'orphan';
}

// GitHub issue for community submissions
export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
}
