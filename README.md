# Type Structure Explorer 🔍

[![VS Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/KiranMantha.peek-type?label=VS%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=KiranMantha.peek-type)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A VSCode extension that reveals complete type structures for TypeScript types through enhanced hover information. Perfect for exploring complex type definitions and nested object structures.

Example:
---
**Before installing extension**:

![before-peek-type.gif](https://raw.githubusercontent.com/KiranMantha/peek-type/refs/heads/main/demo/before-peek-type.gif)

**After installing extension**:

![after-peek-type.gif](https://raw.githubusercontent.com/KiranMantha/peek-type/refs/heads/main/demo/after-peek-type.gif)

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