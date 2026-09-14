import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { MAPPINGS_DIR, REPO_ROOT, rel } from './paths.mjs'

/**
 * Read the .figma.tsx mapping files with the TypeScript compiler API.
 *
 * WHY THE COMPILER AND NOT A REGEX
 * These files are the inventory's source of truth, and CI fails builds on what
 * they say. A regex over TSX would work until the day someone wraps a call in a
 * conditional or splits a string across lines, and then it would silently read
 * the wrong thing — which is worse than not reading it at all. TypeScript is
 * already a dependency of this workspace, so the real parser costs nothing.
 *
 * The site reads the same files a different way: it imports them, and the shim
 * records each call into a registry. Two readers, one source. If they ever
 * disagreed, that would be a bug in this parser, not a second source of truth.
 */

/** The literal text of a node, with quotes/backticks stripped where obvious. */
function textOf(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  return node.getText()
}

function nodeIdFrom(text) {
  const match = text.match(/node-id=([0-9]+)[-:]([0-9]+)/)
  return match ? `${match[1]}:${match[2]}` : null
}

/** Object literal -> plain object of { key: node }. */
function objectProperties(node) {
  const out = new Map()
  if (!node || !ts.isObjectLiteralExpression(node)) return out
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    const name = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
      ? property.name.text
      : property.name.getText()
    out.set(name, property.initializer)
  }
  return out
}

function stringArray(node) {
  if (!node || !ts.isArrayLiteralExpression(node)) return []
  return node.elements.map(textOf)
}

/** figma.enum('Axis', { A: ..., B: ... }) -> { figmaProp, options } */
function propDescriptor(node) {
  if (!ts.isCallExpression(node)) return null
  if (!ts.isPropertyAccessExpression(node.expression)) return null
  const kind = node.expression.name.text
  if (!['enum', 'boolean', 'string', 'instance'].includes(kind)) return null
  const figmaProp = node.arguments[0] ? textOf(node.arguments[0]) : null
  const options = [...objectProperties(node.arguments[1]).keys()]
  return { kind, figmaProp, options }
}

function parseFile(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.ES2023,
    true,
    ts.ScriptKind.TSX,
  )

  const entries = []

  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'figma'
    ) {
      const method = node.expression.name.text
      const where = `${rel(file)}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`

      if (method === 'connect') {
        const config = objectProperties(node.arguments[2])
        const props = {}
        for (const [name, initializer] of objectProperties(config.get('props'))) {
          const descriptor = propDescriptor(initializer)
          if (descriptor) props[name] = descriptor
        }
        entries.push({
          kind: 'connected',
          where,
          figmaName: config.has('figmaName') ? textOf(config.get('figmaName')) : null,
          codeName: config.has('codeName') ? textOf(config.get('codeName')) : null,
          codeSource: config.has('codeSource') ? textOf(config.get('codeSource')) : null,
          nodeId: node.arguments[1] ? nodeIdFrom(node.arguments[1].getText()) : null,
          covers: stringArray(config.get('covers')),
          props,
        })
      } else if (method === 'designOnly') {
        const config = objectProperties(node.arguments[1])
        const urlNode = node.arguments[0]
        entries.push({
          kind: 'design-only',
          where,
          figmaName: config.has('figmaName') ? textOf(config.get('figmaName')) : null,
          nodeId: urlNode && urlNode.kind !== ts.SyntaxKind.NullKeyword ? nodeIdFrom(urlNode.getText()) : null,
        })
      } else if (method === 'codeOnly') {
        const config = objectProperties(node.arguments[0])
        entries.push({
          kind: 'code-only',
          where,
          // Declared inside a loop over a const array, so the literal is not at
          // the call site. Those are read from the array below instead.
          codeName: config.has('codeName') ? textOf(config.get('codeName')) : null,
          codeSource: config.has('codeSource') ? textOf(config.get('codeSource')) : null,
        })
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(source)

  // `figma.codeOnly` is called in a loop over a declared array in
  // inventory.figma.tsx, so the call site has no literals. Pick the array up
  // directly — declared as `const CODE_ONLY: ...[] = [ ... ]`.
  const codeOnlyFromArray = []
  const collectArray = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'CODE_ONLY' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const element of node.initializer.elements) {
        const config = objectProperties(element)
        codeOnlyFromArray.push({
          kind: 'code-only',
          where: `${rel(file)}:${source.getLineAndCharacterOfPosition(element.getStart()).line + 1}`,
          codeName: config.has('codeName') ? textOf(config.get('codeName')) : null,
          codeSource: config.has('codeSource') ? textOf(config.get('codeSource')) : null,
        })
      }
    }
    ts.forEachChild(node, collectArray)
  }
  collectArray(source)

  const withoutLoopPlaceholders = entries.filter(
    (entry) => !(entry.kind === 'code-only' && entry.codeName === null),
  )

  return [...withoutLoopPlaceholders, ...codeOnlyFromArray]
}

/** Every entry declared by every mapping file. */
export function readMappings() {
  if (!fs.existsSync(MAPPINGS_DIR)) {
    throw new Error(`No mappings directory at ${rel(MAPPINGS_DIR)}`)
  }
  const files = fs
    .readdirSync(MAPPINGS_DIR)
    .filter((name) => name.endsWith('.figma.tsx') || name.endsWith('.figma.ts'))
    .sort()
    .map((name) => path.join(MAPPINGS_DIR, name))

  if (files.length === 0) {
    throw new Error(`No .figma.tsx files in ${rel(MAPPINGS_DIR)}`)
  }

  return files.flatMap(parseFile)
}

/** The names a module exports, for checking that a mapping still resolves. */
export function exportedNames(repoRelativeSource) {
  const file = path.join(REPO_ROOT, repoRelativeSource)
  if (!fs.existsSync(file)) return null

  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.ES2023,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )

  const names = new Set()
  const visit = (node) => {
    const exported = ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export
    if (exported && (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
      names.add(node.name.text)
    }
    if (exported && ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text)
      }
    }
    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const element of node.exportClause.elements) names.add(element.name.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return names
}
