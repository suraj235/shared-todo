import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAbw1JXFb8hpwt2ldel7d-sR9pPr5-m1wA",
  authDomain: "shared-todo-6eba3.firebaseapp.com",
  projectId: "shared-todo-6eba3",
  appId: "1:363141611449:web:acfcbbc8fefab3ce36c068"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
