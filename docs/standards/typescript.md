# TypeScript Standards

This project uses TypeScript. All code must be written in TypeScript.

## Configuration

- `target`: ES2022
- `module`: NodeNext (ES modules)
- `strict`: true

## Rules

### 1. Use TypeScript exclusively

- All source files must be `.ts`
- No `.js` or `.mjs` files in `src/` or `scripts/`
- Use `ts-node` for running TypeScript scripts directly

### 2. Type safety

- Enable `strict` mode in tsconfig
- Avoid `any` — use `unknown` when type is uncertain, then narrow
- Export interfaces/types for all shared types

### 3. Naming conventions

- **Files**: `kebab-case.ts` (e.g., `logger.ts`, `schema-loader.ts`)
- **Interfaces**: `PascalCase` (e.g., `interface LoggerOptions`)
- **Types**: `PascalCase` (e.g., `type LogLevel`)
- **Enums**: `PascalCase` with `const` enums preferred

### 4. Imports

- Use explicit extensions for local imports: `import { x } from "./file.js"`
- Use named exports over default exports
- Group imports: external → internal → types

### 5. Async

- Use `async`/`await` over raw Promises
- Use `Promise.all()` for parallel operations
- Handle errors with try/catch at appropriate boundaries

### 6. Error handling

- Use typed errors from the logging standards
- Throw errors with context, don't silently catch
- Log errors with the Logger before throwing

### 7. Testing

- Place tests alongside source: `scripts/foo.ts` → `scripts/foo.test.ts`
- Use Vitest or Node's built-in test runner

## Running

```bash
# Type check
npm run typecheck

# Run a script
npm run build:index

# Run with ts-node (auto-reload)
npx ts-node scripts/refresh.ts
```

## Migration

To convert `.mjs` to `.ts`:

1. Rename file: `foo.mjs` → `foo.ts`
2. Add JSDoc types or convert to TypeScript types
3. Run `npm run typecheck` to verify
4. Update any import paths to use `.js` extension (for ES modules)
