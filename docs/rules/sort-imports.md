# `jsort/sort-imports` Rule

> Rule to sort and format imports by a specified order.

Includes sorting by source, specifier (named import), and type of import (value import/type import).

## Examples

### Sorting by Type

Can be setup to group different sections of imports by a certain style.

The `memberSyntaxSortOrder` configuration allows you to sort and group by:

- `value-none`: Side effect imports. (ie `import "./for-side-effects.js";`)
- `value-all`: Namespace imports. (ie `import * as ValueNamespace from './util';`)
- `value-multiple`: Multiple module imports. (ie `import { A, B } from './letters';`)
- `value-default`: Default imports. (ie `import Cow from './cow';`)
- `type-all`: Type namespace imports. (ie `import type * as TypeNamespace from './util';`)
- `type-multiple`: Multiple type imports. (ie `import type { Letter, Number } from './things';`)
- `type-default`: Type default imports. (ie `import type Person from './person';`)

The `sourceSortOrder` configuration allows you to sort and group by:

- `global`: Global modules. (ie `import React from 'react';`)
- `local`: Local modules. (ie `import MyComponent from './my-component';`)

The `sortFunctionOrder` configuration allows you to prioritize the sort functions used.

- `sourceSortOrder`: Sort by the `sourceSortOrder` configuration.
- `memberSyntaxSortOrder`: Sort by the `memberSyntaxSortOrder` configuration.
- `sourceName`: Sort by the source of the import declaration.
- `specifierCount`: Sort by the amount of import specifiers an import declaration has. (ie `import { a, b } from './local';` has two)

The default configuration is set to:

```js
{
  "rules": {
    "jsort/sort-imports": [
      "error",
      {
        "memberSyntaxSortOrder": [
          "value-none",
          "value-all",
          "value-multiple",
          "value-default",
          "type-all",
          "type-multiple",
          "type-default",
        ],
        "sourceSortOrder": [
          "global",
          "local"
        ],
        "sortFunctionOrder": [
          "sourceSortOrder",
          "memberSyntaxSortOrder",
          "sourceName",
          "specifierCount",
        ],
      }
    ]
  }
}
```

**invalid**

```js
import { b, c } from './c.js';
import './value-none';
import * as valueAll from './value-all';
import defaultValue from './defaultValue';
import type { a } from './a.js';
import type defaultType from './defaultType.js';
import type * as allType from './allType.js';
import React from 'react';
import type { Node } from 'react';
```

**valid**

```js
import React from 'react';
import type { Node } from 'react';
import './value-none';
import * as valueAll from './value-all';
import { b, c } from './c.js';
import defaultValue from './defaultValue';
import type * as allType from './allType.js';
import type { a } from './a.js';
import type defaultType from './defaultType.js';
```

### Sorting by Source

Can be setup to ignore import source sorting or certain aspects of sorting by source.
This can be configured with `ignoreCase` and `ignoreDeclarationSort` options.
The default configuration is set to:

```js
{
  "rules": {
    "jsort/sort-imports": [
      "error",
      {
        "ignoreCase": false,
        "ignoreDeclarationSort": false
      }
    ]
  }
}
```

**invalid**

```js
import { b } from './b.js';
import { a } from './a.js';
```

**Valid**

```js
import { a } from './a.js';
import { b } from './b.js';
```

### Sorting by Specifier

Can be setup to ignore import specifier sorting.
This can be configured with `ignoreMemberSort` and `sortByLocalImportNames`.
The default configuration is set to:

```js
{
  "rules": {
    "jsort/sort-imports": [
      "error",
      {
        "ignoreMemberSort": false,       // import { A, B } from './util';
        "sortByLocalImportNames": false  // import { A as Z, B as Y, C as X } from './util';
      }
    ]
  }
}
```

**invalid**

```js
import { b, a } from './b.js';
import { c } from './c.js';
import { C as X, B as Y, A as Z } from './util';
```

**valid**

```js
import { a, b } from './b.js';
import { c } from './c.js';
import { A as Z, B as Y, C as X } from './util';
```

### Force Combine Same Source Imports

Will combine imported specifiers into the same line.
This can be configured with `forceCombineSameSources`.
The default configuration is set to:

```js
{
  "rules": {
    "jsort/sort-imports": [
      "error",
      {
        "forceCombineSameSources": true,
      }
    ]
  }
}
```

### Force Explicit Default Imports

Will explicitly import the default export as a multiple import specifier.
This can be configured with `forceExplicitDefaultImports`.
The default configuration is set to:

```js
{
  "rules": {
    "jsort/sort-imports": [
      "error",
      {
        "forceExplicitDefaultImports": false,
      }
    ]
  }
}
```

**invalid**

```js
import A, { b, c } from './module-a';
import D from './module-b';
```

**valid**

```js
import { default as A, b, c } from './module-a';
import { default as D } from './module-b';
```

### Force Single Line Imports

Useful for reducing merge conflicts.
This can be configured with `forceSingleLineImports`.
The default configuration is set to:

```js
{
  "rules": {
    "jsort/sort-imports": [
      "error",
      {
        "forceSingleLineImports": false,
      }
    ]
  }
}
```

**invalid**

```js
import { a, b, c } from './a';
```

**valid**

```js
import { a } from './a';
import { b } from './a';
import { c } from './a';
```

### Force Explicit Type Imports

Explicitly import types. This will split import declarations with mixed type and value imports.
This doesn't really apply to too many people but for those running specific parsers that allow
mixing type and value imports (ie `import { type TypeSpecifier, ValueSpecifier } from './util';`)
this will split them.

There are a few reason you want to do this.

1. Packaging systems include the referenced type code - Not explicitly filtering it out.
2. Other parsers don't allow this and are actively not going to support it.
3. Split reads a lot better.

This can be configured with `forceExplicitTypeImports`.
The default configuration is set to:

```js
{
  "rules": {
    "jsort/sort-imports": [
      "error",
      {
        "forceExplicitTypeImports": true,
      }
    ]
  }
}
```

**valid**

```js
import type { a } from './util';
import { b } from './util';
```

**invalid**

```js
import { type a, b } from './util'; // Mixed import declaration type.
```

