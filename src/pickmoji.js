import emoji from 'node-emoji';
import readline from 'readline';
import clipboardy from 'clipboardy';

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

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
  prompt: SEARCH_MSG,
});


const searchEmoji = (inputLine) => {
  const results = emoji.search(inputLine);
  return results.map(result => result.emoji);
}

const getThatEmoji = () => {
  rl.prompt();
  let currentMode = MODES.searching;
  let potentialEmojis = [];

  rl.on('line', (inputLine) => {
    if(isNaN(inputLine.charCodeAt(0))) {
      exit(0);
    }

    switch (currentMode.type) {
      case MODES.searching.type: {
        potentialEmojis = searchEmoji(inputLine);
        const nbEmojis = potentialEmojis.length;

        if (nbEmojis === 1) {
          const foundEmoji = potentialEmojis[0];
          clipboardy.writeSync(foundEmoji);
          log(copiedMsg(foundEmoji));

          exit(0);
        }

        if (nbEmojis > 0) {
          const renderedEmojis = potentialEmojis.map((emoji, index) => `${index}.${emoji}`).join('  ');

          log();
          log(renderedEmojis);
          log();

          currentMode = MODES.picking;
          break;
        }

        log('\n404 Not Found ! Try again !\n')
        break;
      }

      case MODES.picking.type: {
        const index = parseInt(inputLine);

        if (!isNaN(index) && index <= potentialEmojis.length - 1) {
          const theChosenOne = potentialEmojis[index];
          clipboardy.writeSync(theChosenOne);

          log();
          log(copiedMsg(theChosenOne));

          exit(0);
        } else if (inputLine === 'N') {
          currentMode = MODES.searching;
          break;
        } else {
          log('\nNot a number 💩 ! Try again !\n')
          currentMode = MODES.searching;
        }
        break;
      }

      default: {
        log('Something went very wrong !')
      }
    }

    rl.setPrompt(currentMode.msg);
    rl.prompt();

  }).on('close', () => {
    log(EXIT_MSG);
    exit(0);
  });
}

getThatEmoji();
