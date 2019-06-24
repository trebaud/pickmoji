#!/usr/bin/env node
'use strict';

const importJsx = require('import-jsx');
const emoji = require('node-emoji');
const clipboardy = require('clipboardy');

const { log } = console;
const [,, ...args] = process.argv;

if (args.length) {
  const emojisObj = emoji.search(args[0]);
  if (emojisObj.length === 1 && emojisObj[0].key === args[0]) {
    const foundEmoji = emojisObj[0].emoji;
    clipboardy.writeSync(foundEmoji);

    log();
    log(`${foundEmoji} copied to clipboard`);
    process.exit();
  } else {
    log('\n404 Not Found\n')
  }
}

importJsx('./Pickmoji');
