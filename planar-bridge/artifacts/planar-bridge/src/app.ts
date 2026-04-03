import React, { Component } from 'react';
import { AppProvider } from './store/AppContext';
import './app.scss';

class App extends Component {
  onLaunch() {}

  render() {
    return React.createElement(AppProvider, null, this.props.children);
  }
}

export default App;
