# jsort

> Rule to sort and format imports by a specified order.

Includes sorting by source, specifier (named import), and type of import (value import/type import).

## Examples

### Sorting by Type

Can be setup to group different sections of imports by a certain style.
This can be configured with `memberSyntaxSortOrder` and `sourceSortOrder`.
The default configuration is set to:

```js
{
  "rules": {
    "jsort/jsort-imports": [
      "error",
      {
        "memberSyntaxSortOrder": [
          "value-none",     // import "./for-side-effects.js";
          "value-all",      // import * as ValueNamespace from './util';
          "value-multiple", // import { A, B } from './letters';
          "value-default",  // import Cow from './cow';
          "type-all",       // import type * as TypeNamespace from './util';
          "type-multiple",  // import type { Letter, Number } from './things';
          "type-default",   // import type Person from './person';
        ],
        "sourceSortOrder": [
          "global",         // import React from 'react';
          "local"           // import MyComponent from './my-component';
        ]
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
    "jsort/jsort-imports": [
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
    "jsort/jsort-imports": [
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
    "jsort/jsort-imports": [
      "error",
      {
        "forceCombineSameSources": true,
      }
    ]
  }
}
```

### Force Single Line Imports

Useful for reducing merge conflicts.
This can be configured with `forceSingleLineImports`.
The default configuration is set to:

```js
{
  "rules": {
    "jsort/jsort-imports": [
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

