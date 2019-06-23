const React = require('react');
const { render, Color, Text, Box } = require('ink')
const emoji = require('node-emoji');
const readline = require('readline');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const SEARCH_MSG = '> Search an emoji 🔍  ';
const PICK_MSG = 'Which one ❓ (Press N to search again) ';
const EXIT_MSG = 'Happy emojing !! 👋 👋';

class PickmojiComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      query: '',
      stopSearch: false,
    };
	}

  handleSearchEmoji(queryString) {
    const emojisObj = emoji.search(query);
    const emojis = emojisObj.map(result => result.emoji);   
    this.setState({ emojis });
  }

  componentDidMount() {
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.exit();
      } else if (key.name === 'backspace') {
        this.setState({ query: this.state.query.slice(0,-1) })
      } else if (key.name === 'return') {
        this.setState({ stopSearch: true })
      } else {
        this.setState({ query: this.state.query.concat(key.name) })
      }
    });
	}

	render() {
    const { query } = this.state;
    const emojis = emoji.search(query)
      .map((emoji, index) => `${index} ${emoji.emoji}`)
      .join(' ');

		return (
      <div>
        <Color green>
          { query }
        </Color>
        <Box marginTop={1}>
          {
            query && (
              <Text>{ emojis }</Text>
            )
          }
        </Box>
      </div>
		);
	}
}

const pickmoji = render(<PickmojiComponent/>);

module.exports = pickmoji;

