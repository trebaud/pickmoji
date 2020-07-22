const React = require('react');
const { render, Color, Text, Box } = require('ink')
const emoji = require('node-emoji');
const readline = require('readline');
const clipboardy = require('clipboardy');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const SEARCH_MSG = '🔍 (Press Enter to pick an emoji) >';
const PICK_MSG = 'Pick a number (Esc to go back to search) > ';

const KEYS = {
  BACKSPACE: 'backspace',
  RETURN: 'return',
  ESC: 'escape',
};

class PickmojiComponent extends React.Component {
  constructor() {
    super();
    const { query = '', chosenEmoji = '' } = this.processArgs();

    this.state = {
      query,
      pick: '',
      chosenEmoji,
      searching: true,
    };
  }

  componentDidMount() {
    if(this.state.chosenEmoji) {
      process.exit();
    }
    this.handleKeyPress();
  }

  copy(emoji) {
    clipboardy.writeSync(emoji);
  }

  processArgs() {
    let chosenEmoji;
    let query;
    const [,, ...args] = process.argv;

    if (args.length) {
      const emojisObj = emoji.search(args[0]);
      if (emojisObj.length === 1 && emojisObj[0].key === args[0]) {
        chosenEmoji = emojisObj[0].emoji;
        this.copy(chosenEmoji);
      } else {
        query = args[0];
      }
    }
    return({ query, chosenEmoji });
  }

  handlePressEnter() {
    const { searching, pick, query } = this.state;

    const potentialEmojis = emoji.search(query);
    const emojiWasPicked = !searching && pick && !isNaN(pick) && pick < potentialEmojis.length;
    const stopSearching = searching && query;

    if (emojiWasPicked || potentialEmojis.length === 1) {
      let chosenEmoji = potentialEmojis[0].emoji;
      if (emojiWasPicked) {
        chosenEmoji = emoji.search(this.state.query)[this.state.pick].emoji;
      }

      this.copy(chosenEmoji);
      this.setState({ chosenEmoji });
      process.exit();
    }

    if (stopSearching) {
      this.setState({ searching: false });
    }
  }

  handlePressBackspace() {
    const newState = this.state.searching
      ? { query: this.state.query.slice(0,-1) }
      : { pick: this.state.pick.slice(0,-1) };
    this.setState(newState);
  }

  handlePressEsc() {
    // Go back to searching
    if (!this.state.searching) {
      this.setState({ searching: true, pick: '' });
    }
  }

  handlePressAnyChar(key) {
    if (/[A-Za-z0-9]/.test(key.name)) {
      const newState = this.state.searching
        ? { query: this.state.query.concat(key.name) }
        : { pick: this.state.pick.concat(key.name) };
      this.setState(newState);
    }
  }

  handleKeyPress() {
    process.stdin.on('keypress', (_, key) => {
      switch(key.name) {
        case KEYS.BACKSPACE: {
          this.handlePressBackspace();
          break;
        }

        case KEYS.RETURN: {
          this.handlePressEnter();
          break;
        }

        case KEYS.ESC: {
          this.handlePressEsc();
          break;
        }

        default: {
          if (key.ctrl && key.name === 'c') {
            process.exit();
          }

          this.handlePressAnyChar(key);
        }
      }
    });
  }

  renderEmojis(emojis) {
    return emojis.map(({ emoji }, index) => this.state.searching ? emoji : `${index} ${emoji}`)
      .slice(0,20)
      .join('    ');
  }

  render() {
    const { chosenEmoji, query, searching, pick } = this.state;
    const emojis = emoji.search(query);

    const prompt = searching ? `${SEARCH_MSG} ${query}` : `${PICK_MSG} ${pick}`;

    if (chosenEmoji) {
      return (
        <Box padding={2}>{ `${chosenEmoji}  was copied to clipboard!` }</Box>
      )
    }

    return (
      <div>
        <Box marginTop={1}>
          <Color green>
            <Text bold>{prompt}</Text>
          </Color>
        </Box>
        <Box marginTop={1}>
          {
            query && emojis && <Text>{ this.renderEmojis(emojis) }</Text>
          }
        </Box>
      </div>
    );
  }
}

const pickmoji = render(<PickmojiComponent/>);

module.exports = pickmoji;
