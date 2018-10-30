import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import io from 'socket.io-client';
import { ApplicationBar } from './AppBar';
import Control from './Control';
import Game from './Game';

class App extends Component {
  constructor() {
    super();
    this.socket = io();
  }
  render() {
    return (
      <CssBaseline>
        <ApplicationBar tagline="cards.levin.pw" />
        <Control socket={this.socket} />
        <Game socket={this.socket} />
      </CssBaseline>
    );
  }
}

export default App;
