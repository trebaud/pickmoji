#!/usr/bin/env node
'use strict';

const pickmoji = require('./pickmoji');

const [,, ...args] = process.argv;
pickmoji(args[0]);
