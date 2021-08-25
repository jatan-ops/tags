import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const app = firebase.initializeApp({
  apiKey: 'AIzaSyApBmU0wMoTqk30hg7VbBUjfmXzkPlXlpY',
  authDomain: 'tags-3b532.firebaseapp.com',
  projectId: 'tags-3b532',
  storageBucket: 'tags-3b532.appspot.com',
  messagingSenderId: '707814490693',
  appId: '1:707814490693:web:d928a70d91462509c2992c'
});

export const auth = app.auth();

export const db = firebase.firestore();
