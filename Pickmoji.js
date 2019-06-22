const React = require('react');
const { render, Color } = require('ink')

class PickmojiComponent extends React.Component {
	render() {
		return (
			<Color green>
        Hello
			</Color>
		);
	}
}

const pickmoji = render(<PickmojiComponent/>);

module.exports = pickmoji;

