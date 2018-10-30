import React from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

class Control extends React.Component {
  constructor() {
    super();
    this.state = {
      socket: this.props.socket,
      userName: '',
      roomName: ''
    };
  }
  render() {
    return (
      <Paper className="control">
        <Button variant="contained" color="primary">
          Hello
        </Button>
        <label htmlFor="userName">Name:</label>
        <input type="text" name="Name" />
        <label htmlFor="roomName">Room name:</label>
        <input type="text" name="roomName" />
        <label htmlFor="roomPw">Room password:</label>
        <input type="password" name="roomPw" />
      </Paper>
    );
  }
}
export default Control;
