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
  'eslint-plugin-isort',
  'eslint-plugin-import-sort',
  'eslint-plugin-sort-imports',
  'eslint-plugin-jsort',
];

try {
  // Parse input.
  const templateReadmePath = './README.symlink.md';
  const templatePackagePath = './package.symlink.json';
  const outputReadmePath = './README.md';
  const outputPackagePath = './package.json';

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
      `Transformed '${templateReadmeFile}' to '${outputReadmePath}'.`,
    );

    // Publish package.
    try {
      console.log(execSync('npm publish', { encoding: 'utf-8' }));
    } catch (e) {
      console.error(e);
    }
  }

  // Reset to original.
  try {
    const outputReadmePath = './README.md';
    const outputPackagePath = './package.json';
    // `README.md`
    console.log(execSync(`git checkout HEAD -- ${outputReadmePath}`));

    // `package.json`
    console.log(execSync(`git checkout HEAD -- ${outputPackagePath}`));
  } catch (e) {
    console.error(e);
  }

  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(2);
}

