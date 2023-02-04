import React, { useEffect } from 'react';
// import logo from './logo.svg';
// import { Counter } from './features/counter/Counter';
import './App.css';
// const playwright = require('playwright');
// import playwright from 'playwright';

function App() {
  /// importing playwright crashes react,
  //  need to make an api request from the front
  // to the  back end, using express. somehow...
  const getScreenshot = async () => {
    // const browser = await playwright.chromium.launch();
    // const context = await browser.newContext({
    //   incognito: true,
    //   recordPerformance: false,
    // });
    // const page = await context.newPage();
    // await page.goto('https://tph-berlin.net/');
    // await page.screenshot({ path: 'example.png' });
    // await browser.close();
  };

  useEffect(() => {
    getScreenshot();
  }, []);
  return (
    <div className='App'>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Counter />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <span>
          <span>Learn </span>
          <a
            className="App-link"
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux-toolkit.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux Toolkit
          </a>
          ,<span> and </span>
          <a
            className="App-link"
            href="https://react-redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Redux
          </a>
        </span>
      </header> */}
    </div>
  );
}

export default App;
