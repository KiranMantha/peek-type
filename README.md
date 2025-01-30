# Type Structure Explorer 🔍

[![VS Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/your-name.type-structure-explorer?label=VS%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=your-name.type-structure-explorer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A VSCode extension that reveals complete type structures for TypeScript types through enhanced hover information. Perfect for exploring complex type definitions and nested object structures.

Example:
---
```typescript
type ComplexType = {
  id: number;
  details: {
    name: string;
    metadata: Array<{
      key: string;
      value: unknown;
    }>;
  };
};

const example: ComplexType;
// ^ Hover here
```

## Features ✨

- **Full Type Expansion**: See nested type structures up to 4 levels deep (configurable)
- **Smart Integration**: Combines with default VSCode type information
- **TypeScript Native**: Works with any TS project using `tsconfig.json`
- **Supports**:
  - Union/Intersection types
  - Type aliases
  - Generics
  - Literal types
  - Circular references
- **Dark/Light Theme** aware

## Installation ⬇️

### From Marketplace
1. Open VSCode extensions panel (⇧⌘X)
2. Search for "Type Structure Explorer"
3. Click Install

### Manual Installation
```bash
git clone https://github.com/your-repo/type-structure-explorer.git
cd type-structure-explorer
npm install
vsce package
code --install-extension peek-type-1.0.0.vsix