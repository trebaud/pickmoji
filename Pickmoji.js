const React = require('react');
const { render, Color, Text, Box } = require('ink')
const emoji = require('node-emoji');
const readline = require('readline');
const clipboardy = require('clipboardy');

const { log } = console;
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const SEARCH_MSG = '🔍 >';
const PICK_MSG = 'Pick a number (Esc to go back to search) > ';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';

class PickmojiComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      query: '',
      pick: '',
      searching: true,
    };
	}

  handleSearchEmoji(queryString) {
    const emojisObj = emoji.search(query);
    const emojis = emojisObj.map(result => result.emoji);   
    this.setState({ emojis });
  }

  copy(emoji) {
    clipboardy.writeSync(emoji);
  }

  componentDidMount() {
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.exit();
      }

      if (key.name === 'backspace') {
        if (this.state.searching) {
          this.setState({ query: this.state.query.slice(0,-1) });
        } else {
          this.setState({ pick: this.state.pick.slice(0,-1) });
        }
      }

      if (key.name === 'return') {
        if (this.state.searching && this.state.query) {
          this.setState({ searching: false });
        }

        if (!this.state.searching && this.state.pick){
          const chosenEmoji = emoji.search(this.state.query)[this.state.pick].emoji;
          this.copy(chosenEmoji);
          console.log(`\n${chosenEmoji} copied to clipboard`)
          process.exit();
        }
      }

      if (key.name === 'escape' && !this.state.searching) {
        this.setState({ searching: true, pick: '', search: ''});
      }

      if (ALPHABET.concat(NUMBERS).includes(key.name)) {
        if (this.state.searching) {
          this.setState({ query: this.state.query.concat(key.name) });
        } else {
          this.setState({ pick: this.state.pick.concat(key.name) });
        }
      }
    });
	}

	render() {
    const { query, searching, pick } = this.state;
    const emojis = emoji.search(query)
      .map(({ emoji }, index) => {
        return searching ? emoji : `${index} ${emoji}`;
      })
      .slice(0,20)
      .join(' ');

    const prompt = searching ? `${SEARCH_MSG} ${query}` : `${PICK_MSG} ${pick}`;

		return (
      <div>
        <Color green>
          <Text bold>{prompt}</Text>
        </Color>
        <Box marginTop={1}>
          {
            query && <Text>{ emojis }</Text>
          }
        </Box>
      </div>
		);
	}
}

const pickmoji = render(<PickmojiComponent/>);

module.exports = pickmoji;

