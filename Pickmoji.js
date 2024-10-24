const React = require("react");
const { render, Color, Text, Box } = require("ink");
const nodeEmoji = require("node-emoji");
const readline = require("readline");
const clipboardy = require("clipboardy");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const SEARCH_MSG = "🔍 (Press Enter to pick an emoji) >";
const PICK_MSG = "Pick a number (press q to go back to search) > ";

const KEYS = {
  BACKSPACE: "backspace",
  RETURN: "return",
  ESC: "escape",
};

class PickmojiComponent extends React.Component {
  constructor() {
    super();
    const { query = "", chosenEmoji = "" } = this.processArgs();

    this.state = {
      query,
      chosenEmoji,
      searching: true,
    };
  }

  componentDidMount() {
    if (this.state.chosenEmoji) {
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
    const [, , ...args] = process.argv;

    if (args.length) {
      const emojisObj = nodeEmoji.search(args[0]);
      if (emojisObj.length === 1 && emojisObj[0].key === args[0]) {
        chosenEmoji = emojisObj[0].emoji;
        this.copy(chosenEmoji);
      } else {
        query = args[0];
      }
    }
    return { query, chosenEmoji };
  }

  pickEmoji(index) {
    const chosenEmoji = nodeEmoji.search(this.state.query)[index].emoji;
    this.copy(chosenEmoji);
    this.setState({ chosenEmoji });
    process.exit();
  }

  handlePressEnter() {
    const potentialEmojis = nodeEmoji.search(this.state.query);
    if (potentialEmojis.length) {
      if (potentialEmojis.length === 1) {
        this.pickEmoji(0);
      } else {
        this.setState({ searching: false });
      }
    }
  }

  handlePressBackspace() {
    if (this.state.searching) {
      this.setState({ query: this.state.query.slice(0, -1) });
    }
  }

  handlePressEsc() {
    if (!this.state.searching) {
      this.setState({ searching: true });
    }
  }

  handlePressAnyChar(keyName) {
    const { searching } = this.state;
    if (!searching) {
      if (keyName === "q") {
        // Go back to searching
        this.setState({ searching: true });
        return;
      }

      if (/[0-9]/.test(keyName)) {
        this.pickEmoji(keyName);
      }
    }

    if (searching) {
      this.setState({ query: this.state.query.concat(keyName) });
    }
  }

  handleKeyPress() {
    process.stdin.on("keypress", (_, key) => {
      switch (key.name) {
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
          if (key.ctrl && key.name === "c") {
            process.exit();
          }

          this.handlePressAnyChar(key.sequence);
        }
      }
    });
  }

  renderEmojis(query) {
    if (query.length < 2) {
      return null;
    }

    const emojis = nodeEmoji.search(query);
    if (!emojis || emojis.length === 0) {
      return null;
    }

    const columns = 4;
    const rows = Math.ceil(emojis.length / columns);

    return (
      <Box flexDirection="column" padding={1}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box key={rowIndex} flexDirection="row" flexWrap="nowrap">
            {emojis
              .slice(0, 10)
              .slice(rowIndex * columns, rowIndex * columns + columns)
              .map((item, columnIndex) => {
                const globalIndex = rowIndex * columns + columnIndex; // Calculate global index
                return this.state.searching ? (
                  <Text key={globalIndex} marginRight={1}>
                    {item.emoji}
                    {"  "}
                  </Text>
                ) : (
                  <Text key={globalIndex} marginRight={1}>
                    <Color magenta>{globalIndex}</Color> {item.emoji}
                    {"  "}
                  </Text>
                );
              })}
          </Box>
        ))}
      </Box>
    );
  }

  render() {
    const { chosenEmoji, query, searching } = this.state;

    const prompt = searching ? `${SEARCH_MSG} ${query}` : PICK_MSG;

    if (chosenEmoji) {
      return (
        <Box padding={1}>
          <Text>
            <Color magenta>{chosenEmoji} was copied to clipboard!</Color>
          </Text>
        </Box>
      );
    }

    return (
      <div>
        <Box marginTop={1}>
          <Color green>
            <Text bold>{prompt}</Text>
          </Color>
        </Box>
        <Box marginTop={1} marginLeft={1} height={12}>
          {this.renderEmojis(query)}
        </Box>
      </div>
    );
  }
}

const pickmoji = render(<PickmojiComponent />);

module.exports = pickmoji;
