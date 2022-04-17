import React, {useCallback, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {dropboxOauthUrl, getAccessToken, getCodeVerifier, createCodeVerifier, writeFile} from "./pkce";

function App() {
  const [url, setUrl] = React.useState('');
  const [accessToken, setAccessToken] = React.useState('');

  useEffect(() => {
    console.log("init");
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    if (code && !accessToken) {
      console.log("getting token");
      const codeVerifier = getCodeVerifier();
      if (codeVerifier) {
        getAccessToken(code, codeVerifier).then(token => {
          setAccessToken(token);
        });
      }
    } else {
      const codeVerifier = createCodeVerifier();
      setUrl(dropboxOauthUrl(codeVerifier))
    }
  }, [accessToken]);

  const write = useCallback(() => {
    console.log("accessToken", accessToken);
    writeFile(accessToken).then(() => {
      console.log("done");
    });
  }, [accessToken]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <a href={url} className="App-link">
          Authorize
        </a>

        {accessToken && <div>
          <button onClick={write}>Write a file</button>
        </div>}
      </header>
    </div>
  );
}

export default App;
