/**
 * The Figma↔code inventory.
 *
 * Importing this module runs every mapping file, which registers its entries.
 * The site's coverage page reads the registry; CI reads the same `.figma.tsx`
 * files through the TypeScript compiler API. Two readers, one source.
 *
 * Order here is the order the coverage table shows.
 */

import './Button.figma'
import './Avatar.figma'
import './ListRow.figma'
import './TextField.figma'
import './Titles.figma'
import './Fate.figma'
import './inventory.figma'

export { allEntries } from './code-connect'
export type { Connection, DesignOnly, CodeOnly, Entry } from './code-connect'
