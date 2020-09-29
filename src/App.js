import React, { useState, useRef, useEffect } from 'react';
import './App.css';
// Import Firebase Dependencies
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'

// Init firebase API
firebase.initializeApp({
  apiKey: "AIzaSyD1NFUn4f22mneGY1Z9eIvrWp1dna_iYR8",
  authDomain: "rumpi-chat-app.firebaseapp.com",
  databaseURL: "https://rumpi-chat-app.firebaseio.com",
  projectId: "rumpi-chat-app",
  storageBucket: "rumpi-chat-app.appspot.com",
  messagingSenderId: "187980907991",
  appId: "1:187980907991:web:b4da30b248272e72aa3792",
  measurementId: "G-WJSJPCB9HH"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  // Get user auth
  const [user] = useAuthState(auth);

  return (
    <div className="app">
      <header className="app-header">
        <h1><span role="img" aria-label="">👄</span></h1>
        <h3>Rumpi<span>Chat</span></h3>
        <Signout />
      </header>
      {user ? <Chatroom /> : <Signin />}
    </div>
  );
}

function Signin() {
  const signWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <section className="signinPage">
      <button onClick={signWithGoogle}>Sign in With Google</button>
    </section>
  );
}

function Signout() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign out</button>
  );
}

function Chatroom() {
  // Get collection
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'desc').limit(25);
  // Collection State
  const [messages] = useCollectionData(query, { idField: 'id' });
  // Form State
  const [formValue, setFormValue] = useState('');

  // Send Data Func
  const sendMessage = async (e) => {
    // Prevent form from submiting
    e.preventDefault();
    // Get user data from auth storage
    const { uid, photoURL } = auth.currentUser;
    // Send data to server
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue('');
  }
  const scrollBottom = useRef();
  
  useEffect(() => {
    scrollBottom.current.scrollIntoView({behavior:'smooth'});
  });

  return (
    <div className="chatroomPage">
      <div className="chat-bubble">
        {messages && messages.reverse().map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={scrollBottom}></div>
      </div>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Tulis pesan..." />
        <button type="submit"><span role="img" aria-label="">💬</span></button>
      </form>
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const msgClass = uid === auth.currentUser.uid ? ' sender' : '';
  return (
    <div className={`bubble${msgClass}`}>
      <div>
        <div className="img-placeholder">
          <img src={photoURL} alt="" />
        </div>
      </div>
      <p>{text}</p>
    </div>
  );
}

export default App;
