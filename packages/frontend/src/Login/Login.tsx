import './Login.css';
import React, { useState } from 'react';
import Web3 from 'web3';
import { Auth } from '../types';

interface Props {
  onLoggedIn: (auth: Auth) => void;
}

interface Authentication {
  address: string;
  signature: string;
}

interface Signature {
  address: string;
  nonce: string;
}

let web3: Web3 | undefined = undefined;

export const Login = ({ onLoggedIn }: Props): JSX.Element => {
  const [loading, setLoading] = useState(false);

  const handleAuthenticate = ({ address, signature }: Authentication) => {
    return fetch(`${process.env.REACT_APP_BACKEND_URL}/auth`, {
      body: JSON.stringify({ address, signature }),
      headers: { 'Content-Type': 'application/json'},
      method: 'POST'
    })
    .then(res => res.json())
  }

  const handleSignMessage = async ({ address, nonce }: Signature) => {
    try {
      const signature = await web3!.eth.personal.sign(
        `Signing with one-time nonce ${nonce}`,
        address,
        ''
      );

      return { address, signature };
    } catch (error) {
      throw new Error('Please sign message to log in');
    }
  }

  const handleSignup = (address: string) => {
    return fetch(`${process.env.REACT_APP_BACKEND_URL}/users`, {
      body: JSON.stringify({ address }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    })
    .then(res => res.json());
  }

  const handleClick = async () => {
    if (!(window as any).ethereum) {
      window.alert('Please install MetaMask first.');
      return;
    }

    if (!web3) {
      try {
        // Request account access if needed.
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        web3 = new Web3((window as any).ethereum);
      } catch (error) {
        window.alert('You need to allow MetaMask');
        return;
      }
    }

    const coinbase = await web3.eth.getCoinbase();
    if (!coinbase) {
      window.alert('Please activate MetaMask first.');
      return;
    }

    const address = coinbase.toLowerCase();
    setLoading(true);

    // Look if current user exist in DB.
    fetch(`${process.env.REACT_APP_BACKEND_URL}/users?address=${address}`)
      .then(res => res.json())
      .then(users => users.length ? users[0] : handleSignup(address))  // if yes return it, if not create it
      .then(handleSignMessage)    // popup MetaMask confirmation modal to sign message
      .then(handleAuthenticate)   // send signature to backend via /auth
      .then(onLoggedIn)           // pass token back to parent component for localStorage saving
      .catch(error => {
        window.alert(error);
        setLoading(false);
      })
  };

  return (
    <div>
      <p>
        Please login.
      </p>
      <button className="Login-button Login-mm" onClick={handleClick}>
        {loading ? 'Loading...' : 'Login with MetaMask'}
      </button>
    </div>
  );
}
