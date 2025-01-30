import * as vscode from "vscode";
import * as ts from "typescript";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("Peek Type [TypeStructure] Extension activated");

  const provider = new EnhancedHoverProvider();
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      ["typescript", "typescriptreact"],
      provider
    )
  );
}

class EnhancedHoverProvider implements vscode.HoverProvider {
  private _tsConfigCache = new Map<string, string>();

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Hover | null> {
    try {
      // Get enhanced type structure
      const typeStructure = await this.getFullTypeStructure(document, position);

      if (!typeStructure) {
        return null;
      }

      const wordRange = document.getWordRangeAtPosition(position);
      if (!wordRange) {
        return null;
      }
      const variableName = document.getText(wordRange);
      const hoverText = `${variableName}: ${typeStructure}`;

      // Create hover popup with structured type info
      const markdown = new vscode.MarkdownString();
      markdown.appendCodeblock(hoverText, "typescript");
      return new vscode.Hover(markdown);
    } catch (error) {
      console.error("[TypeStructure] Error in hover provider:", error);
      return null;
    }
  }

  private async getFullTypeStructure(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<string | null> {
    try {
      const tsConfigPath = await this.resolveTsConfig(document.uri);
      const program = this.createProgram(document, tsConfigPath);

      const sourceFile = program.getSourceFile(document.fileName);
      if (!sourceFile) {
        return null;
      }

      const typeChecker = program.getTypeChecker();
      const positionOffset = document.offsetAt(position);

      const node = this.findNodeAtPosition(sourceFile, positionOffset);
      if (!node) {
        return null;
      }

      const type = typeChecker.getTypeAtLocation(node);
      return this.formatType(type, typeChecker);
    } catch (error) {
      return null;
    }
  }

  private formatType(
    type: ts.Type,
    typeChecker: ts.TypeChecker,
    depth = 0,
    visited = new Set<number>()
  ): string {
    if (!type) {
      return "";
    }

    const typeId = (type as any).id;
    if (visited.has(typeId)) {
      return "...";
    }
    visited.add(typeId);

    const indentation = "  ".repeat(depth);
    let result = "";

    if (type.isUnionOrIntersection()) {
      result += type.types
        .map((t) => this.formatType(t, typeChecker, depth, visited))
        .join(
          `\n${indentation}${type.flags & ts.TypeFlags.Union ? "| " : "& "}`
        );
    } else if (type.isLiteral()) {
      result += typeChecker.typeToString(type);
    } else {
      const symbol = type.getSymbol();
      if (symbol) {
        const declarations = symbol.getDeclarations();
        if (declarations?.length) {
          const firstDecl = declarations[0];

          if (ts.isTypeAliasDeclaration(firstDecl)) {
            return `${symbol.getName()} = ${this.formatType(
              typeChecker.getTypeFromTypeNode(firstDecl.type),
              typeChecker,
              depth,
              visited
            )}`;
          }

          if (ts.isInterfaceDeclaration(firstDecl)) {
            result += `interface ${symbol.getName()} {\n`;
            result += this.extractProperties(
              type,
              typeChecker,
              depth + 1,
              visited
            );
            result += `${indentation}}\n`;
            return result;
          }
        }
      }

      if (type.getProperties().length > 0) {
        result += `{\n${this.extractProperties(
          type,
          typeChecker,
          depth + 1,
          visited
        )}\n${indentation}}`;
      } else {
        result += typeChecker.typeToString(type);
      }
    }

    return result;
  }

  private extractProperties(
    type: ts.Type,
    typeChecker: ts.TypeChecker,
    depth: number,
    visited: Set<number>
  ): string {
    const indentation = "  ".repeat(depth);
    return type
      .getProperties()
      .map((symbol) => {
        const propertyType = typeChecker.getTypeOfSymbolAtLocation(
          symbol,
          symbol.valueDeclaration!
        );
        return `${indentation}${symbol.name}: ${this.formatType(
          propertyType,
          typeChecker,
          depth,
          new Set(visited)
        )};`;
      })
      .join("\n");
  }

  private createProgram(
    document: vscode.TextDocument,
    tsConfigPath?: string
  ): ts.Program {
    const options = tsConfigPath ? this.getCompilerOptions(tsConfigPath) : {};
    return ts.createProgram({
      rootNames: [document.fileName],
      options,
      configFileParsingDiagnostics: [],
    });
  }

  private async resolveTsConfig(uri: vscode.Uri): Promise<string | undefined> {
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    if (!folder) {
      return;
    }

    const cached = this._tsConfigCache.get(folder.uri.fsPath);
    if (cached) {
      return cached;
    }

    const tsConfig = await vscode.workspace.findFiles(
      new vscode.RelativePattern(folder, "**/tsconfig.json"),
      "**/node_modules/**",
      1
    );

    if (tsConfig.length > 0) {
      this._tsConfigCache.set(folder.uri.fsPath, tsConfig[0].fsPath);
      return tsConfig[0].fsPath;
    }
  }

  private getCompilerOptions(tsConfigPath: string): ts.CompilerOptions {
    const configFile = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
    return ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(tsConfigPath)
    ).options;
  }

  private findNodeAtPosition(
    sourceFile: ts.SourceFile,
    position: number
  ): ts.Node | null {
    let result: ts.Node | null = null;

    const findNode = (node: ts.Node) => {
      if (node.getStart() <= position && node.getEnd() >= position) {
        result = node;
        ts.forEachChild(node, findNode);
      }
    };

    ts.forEachChild(sourceFile, findNode);
    return result;
  }
}
