/**
 * The primitives every documentation page is built from.
 *
 * Built once, here. A page composes these; it does not style its own tables or
 * invent its own swatch. Anything that reads a token value does so at runtime
 * through `../tokens`, so no value in this folder is ever written down.
 */

export { Page, Section, SubSection, Prose } from './Page'
export { slug } from './slug'
export { DocTable, Mono } from './DocTable'
export { CodeBlock } from './CodeBlock'
export { TokenSwatch, CANVAS, SURFACE } from './TokenSwatch'
export { ResolvedValue } from './ResolvedValue'
export { ContrastReadout, AA_NORMAL } from './ContrastReadout'
export { CopyableToken } from './CopyableToken'
export { DriftNote } from './DriftNote'
export type { DriftRow } from './DriftNote'
export { ScaleRow } from './ScaleRow'
export { TypeSpecimen } from './TypeSpecimen'
export { PropsTable } from './PropsTable'
export type { PropRow } from './PropsTable'
export { DoDont, Do, Dont } from './DoDont'
export { Callout } from './Callout'
export type { CalloutTone } from './Callout'
