# `jsort/normalize-import-source` Rule

> Rule to normalize import source types.

## Examples

### Normalizing Import Source

Can be setup to include or exclude the cwd from the import source path.

The `sourceLocalImportType` configuration controls this and can be changed to:

- `exclude-cwd`: Excludes the cwd for imports that don't need it.
- `include-cwd`: Includes the cwd for all local imports, even those that don't need it.

The default configuration is set to:

```js
{
  "rules": {
    "jsort/normalize-import-source": [
      "error",
      {
        "sourceLocalImportType": "exclude-cwd"
      }
    ]
  }
}
```

**invalid**

```js
import { b, c } from './../c.js';
```

**valid**

```js
import { b, c } from '../c.js';
```

