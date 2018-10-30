import React from 'react';
import Paper from '@material-ui/core/Paper';
class Game extends React.Component {
  render() {
    return (
      <Paper className="game">
        <div className="players">List of PLayrs</div>
        <div className="chat">Chaat</div>
        <div className="round">
          <div className="blackCard">BlackCard</div>
          <div className="answers">Answers</div>
          <div className="yourCards">Yourcards</div>
        </div>
      </Paper>
      // TODO Players
      // TODO Chat
      // TODO Round
      // TODO Yourcards
    );
  }
}

export default Game;
