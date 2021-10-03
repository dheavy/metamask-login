import './Profile.css';
import jwtDecode from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import Blockies from 'react-blockies';
import { Auth } from '../types';

interface Props {
  auth: Auth;
  onLoggedOut: () => void;
}

interface State {
  loading: boolean;
  user?: {
    id: number;
    username: string;
  };
  username: string;
}

interface JwtDecoded {
  payload: {
    id: string;
    address: string;
  }
}

export const Profile = ({ auth, onLoggedOut }: Props): JSX.Element => {
  const [state, setState] = useState<State>({
    loading: false,
    user: undefined,
    username: ''
  });

  useEffect(() => {
    const { token } = auth;
    const { payload: { id } } = jwtDecode<JwtDecoded>(token);

    fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(user => setState({ ...state, user }))
    .catch(window.alert);
  }, []);

  const handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, username: value });
  };

  const handleSubmit = () => {
    const { token } = auth;
    const { user, username } = state;
    setState({ ...state, loading: true });

    if (!user) {
      window.alert('The User ID has not been fetched yet. Please try again in 5 seconds.');
      return;
    }

    fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${user.id}`, {
      body: JSON.stringify({ username }),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'PATCH'
    })
    .then(res => res.json())
    .then(user => setState({ ...state, loading: false, user }))
    .catch(error => {
      window.alert(error);
      setState({ ...state, loading: false })
    });
  }

  const { token } = auth;
  const { payload: { address } } = jwtDecode<JwtDecoded>(token);
  const { loading, user } = state;
  const username = user && user.username;

  return (
    <div className="Profile">
      <p>
        Logged in as <Blockies seed={address} />
      </p>
      <div>
        My username is {username ? <pre>{username}.</pre> : 'not set'}
        <br />
        My address is <pre>{address}</pre>.
      </div>
      <div>
        <label htmlFor="username">Change username: </label>
        <input name="username" onChange={handleChange} />
        <button disabled={loading} onClick={handleSubmit}>
          Submit
        </button>
      </div>
      <p>
        <button onClick={onLoggedOut}>Logout</button>
      </p>
    </div>
  );
}
