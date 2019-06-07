import emoji from 'node-emoji';
import readline from 'readline';
import clipboardy from 'clipboardy';

const { log } = console;
const { stdin, stdout, exit } = process;

const SEARCH_MSG = '> Search an emoji 🔍  ';
const PICK_MSG = 'Which one ❓ ';
const EXIT_MSG = '\n\nHappy emojing !! 👋 👋';

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
  prompt: SEARCH_MSG,
});

let potentialEmojis;

const getThatEmoji = () => {
  rl.prompt('heelo');

  let searching = true;
  rl.on('line', (line) => {
    if(isNaN(line.charCodeAt(0))) {
      exit(0);
    }

    if (searching) {
      const results = emoji.search(line);
      potentialEmojis = results.map(result => result.emoji);

      if (potentialEmojis.length > 0) {
        log();
        log(potentialEmojis.join('  '));
        log();
      }
      
      if (potentialEmojis.length === 1) {
        clipboardy.writeSync(potentialEmojis[0]);
        log(EXIT_MSG);
        exit(0);
      }

      if (potentialEmojis.length !== 0) {
        searching = !searching;
      } else {
        log('\n404 not found ! Try again !\n')
      }

    } else {
      const index = parseInt(line);
      if (!isNaN(index) && index <= potentialEmojis.length - 1) {
        const theChosenOne = potentialEmojis[index];

        log();
        log(theChosenOne);

        clipboardy.writeSync(theChosenOne);
        process.exit(0);
      } else {
        log('\nNot a number 💩 ! Try again !\n')
      }

      searching = !searching;
    }

    const promptMsg = searching ? SEARCH_MSG : PICK_MSG ;
    rl.setPrompt(promptMsg);
    rl.prompt();

  }).on('close', () => {
    log(EXIT_MSG);
    exit(0);
  });
}

getThatEmoji();
