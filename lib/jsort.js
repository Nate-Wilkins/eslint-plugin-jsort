/**
 * @fileoverview Sort imports effortlessly.
 * @author nate-wilkins <nwilkins2012@gmail.com> (https://github.com/nate-wilkins)
 * @license Apache-2.0 (c) 2021
 */
'use strict';

module.exports = {
  rules: {
    'normalize-import-source': require('./rules/normalize-import-source'),
    'sort-imports': require('./rules/sort-imports'),
  },
};

