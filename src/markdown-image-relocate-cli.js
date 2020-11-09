#!/usr/bin/env node
// Downloads and replaces images in a markdown file so they are local

const { downloadImages } = require('./relocator');
const fs = require('fs');

// CLI options
const yargs = require('yargs') // eslint-disable-line
  .scriptName('markdown-image-replace')
  .version()
  .wrap(null)
  .usage(' Usage: $0 -f INPUT-FILE.md -o OUTPUT-FILE.md')
  .example('Download and relocate images:', 'markdown-image-replace -f post.md -o converted.md')
  .alias('f', 'read-markdown')
  .describe('f', 'Read a markdown file')
  .demandOption('read-markdown')
  .alias('o', 'write-markdown')
  .describe('o', 'Write converved markdown file')
  .demandOption('write-markdown')
  .alias('d', 'image-dir')
  .describe('d', 'Folder to store local images (default: ./img)')
  .default('image-dir', 'img')
  .help('h')
  .alias('h', 'help');
const argv = yargs.argv;

const inputText = fs.readFileSync(argv['read-markdown']).toString();

(async () => {
    let outputText = await downloadImages(inputText, argv['image-dir']);
    fs.writeFileSync(argv['write-markdown'], outputText);
})().catch(e => {
    console.error(e);
});