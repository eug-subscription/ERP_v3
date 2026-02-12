# Babel Dependencies

The following Babel devDependencies in `package.json` are required by the custom Vite plugins:

- `@babel/core` - Core Babel transformation engine
- `@babel/generator` - Code generation from AST  
- `@babel/preset-react` - React JSX transformation preset
- `@babel/preset-typescript` - TypeScript transformation preset
- `@babel/traverse` - AST traversal utilities
- `@babel/types` - AST node type definitions

**Used by:**

- `plugins/vite-plugin-inject-data-locator.ts` - Vite plugin that transforms JSX/TSX files
- `plugins/babel-plugin-inject-data-locator.ts` - Babel plugin that injects `data-locator` attributes to JSX elements for development debugging

These dependencies enable automatic injection of `data-locator` attributes during development builds, which helps identify component locations in the source code.
