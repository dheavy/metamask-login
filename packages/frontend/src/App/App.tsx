import './App.css';
import React, { useEffect, useState } from 'react';
import { Profile } from '../Profile/Profile';
import { Login } from '../Login';
import { Auth } from '../types';
import logo from './logo.svg';

const TOKEN_KEY = 'metamask-login:auth';

interface State {
  auth?: Auth;
}

export const App = (): JSX.Element => {
  const [state, setState] = useState<State>({});

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const auth = token && JSON.parse(token);
    setState({ auth });
  }, []);

  const handleLoggedIn = (auth: Auth) => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(auth));
    setState({ auth });
  };

  const handleLoggedOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ auth: undefined });
  };

  const { auth } = state;

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Login with MetaMask</h1>
      </header>
      <div className="App-intro">
        {
          auth
            ? (<Profile auth={auth} onLoggedOut={handleLoggedOut} />)
            : (<Login onLoggedIn={handleLoggedIn} />)
        }
      </div>
    </div>
  );
}
