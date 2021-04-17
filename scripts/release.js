#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const { execSync } = require('child_process');
const Mustache = require('mustache');

const loadJsonFileSync = filePath => {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// NOTE: If there are efforts to use these names I think its fair to remove them if the request can't be made with jsort.
const packageNames = [
  'eslint-plugin-jsort',
  'eslint-plugin-isort',
  'eslint-plugin-import-sort',
  'eslint-plugin-sort-imports',
];

// Login.
execSync('npm login', {
  encoding: 'utf-8',
  stdio: 'inherit',
});

try {
  // Parse input.
  const templateReadmePath = './README.symlink.md';
  const templatePackagePath = './package.symlink.json';
  const outputReadmePath = './dist/README.md';
  const outputPackagePath = './dist/package.json';

  // Copy source to output.
  execSync('rm -rf ./dist');
  execSync('mkdir -p ./dist');
  execSync('cp ./.npmignore ./dist/');
  execSync('cp -r ./lib ./dist/');

  // Load templates.
  const templatePackageFile = fs.readFileSync(templatePackagePath, 'utf-8');
  const templateReadmeFile = fs.readFileSync(templateReadmePath, 'utf-8');

  for (const pkgName of packageNames) {
    // Write `package.json`.
    fs.writeFileSync(
      outputPackagePath,
      Mustache.render(templatePackageFile, {
        name: pkgName,
      }),
    );
    console.info(
      `Transformed '${templatePackagePath}' to '${outputPackagePath}'.`,
    );

    // Load up `package.json` for context in other templates.
    const pkg = loadJsonFileSync('package.json');

    // Write `README.md`.
    fs.writeFileSync(
      outputReadmePath,
      Mustache.render(templateReadmeFile, {
        package: pkg,
      }),
      'utf-8',
    );
    console.info(
      `Transformed '${templateReadmePath}' to '${outputReadmePath}'.`,
    );

    // Publish package.
    try {
      console.log(`Publishing '${pkgName}'.`);
      execSync('./node_modules/.bin/np --contents ./dist', {
        encoding: 'utf-8',
        stdio: 'inherit',
      });
    } catch (e) {
      console.error(e);
    }
  }

  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(2);
}

