const emoji = require('node-emoji');
const readline = require('readline');
const clipboardy = require('clipboardy');

const { log } = console;
const { stdin, stdout, exit } = process;

const SEARCH_MSG = '> Search an emoji 🔍  ';
const PICK_MSG = 'Which one ❓ (Press N to search again) ';
const EXIT_MSG = '\n\nHappy emojing !! 👋 👋';

const copiedMsg = (chosenEmoji) => `Emoji ${chosenEmoji} copied to clipboard !`

const MODES = {
  searching: {
    type: 'searching',
    msg: SEARCH_MSG,
  },
  picking: {
    type: 'picking',
    msg: PICK_MSG,
  }
};

let STATE = {
  mode: MODES.searching,
  emojis: [],
}

const setState = (newState) => Object.entries(newState).forEach(([key, value]) => STATE[key] = value);

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
  prompt: SEARCH_MSG,
});


const searchEmoji = (inputLine) => {
  const results = emoji.search(inputLine);
  return results.map(result => result.emoji);
}

const handleSearch = (query) => {
  const emojis = searchEmoji(query);
  const nbEmojis = emojis.length;

  if (nbEmojis === 0) {
    log('\n404 Not Found ! Try again !\n')
    return { nextMode: MODES.searching, emojis };
  }

  if (nbEmojis === 1) {
    const foundEmoji = emojis[0];
    clipboardy.writeSync(foundEmoji);
    log(copiedMsg(foundEmoji));
    exit(0);
  }

  const renderedEmojis = emojis.map((emoji, index) => `${index}.${emoji}`).join('  ');
  log();
  log(renderedEmojis);
  log();

  return { nextMode: MODES.picking, newEmojis: emojis };
}

const handlePick = (input, potentialEmojis) => {
  const parsedInput = parseInt(input);
  if (!isNaN(parsedInput) && parsedInput <= potentialEmojis.length - 1) {
    const theChosenOne = potentialEmojis[parsedInput];
    clipboardy.writeSync(theChosenOne);

    log();
    log(copiedMsg(theChosenOne));

    exit(0);
  }

  if (input !== 'N') {
    log('\nNot a number 💩 ! Try again !\n');
  }

  return { nextMode: MODES.searching };
}

const promptQuestion = () => {
  rl.setPrompt(STATE.mode.msg);
  rl.prompt();
}

const pickmoji = (arg) => {
  let hasArg = !!arg;

  if (hasArg) {
    const { nextMode, newEmojis } = handleSearch(arg);
    setState({ mode: nextMode, emojis: newEmojis })
    hasArg = !hasArg;
  }

  promptQuestion();

  rl.on('line', (inputLine) => {
    const { mode, emojis } = STATE;
    if(isNaN(inputLine.charCodeAt(0))) {
      exit(0);
    }

    switch (mode.type) {
      case MODES.searching.type: {
        const { nextMode, newEmojis } = handleSearch(inputLine);
        setState({ mode: nextMode, emojis: newEmojis })
        break;
      }

      case MODES.picking.type: {
        const { nextMode } = handlePick(inputLine, emojis);
        setState({ mode: nextMode });
        break;
      }

      default: {
        log('Something went very wrong !')
      }
    }

    promptQuestion();
  }).on('close', () => {
    log(EXIT_MSG);
    exit(0);
  });
}

module.exports = pickmoji;
