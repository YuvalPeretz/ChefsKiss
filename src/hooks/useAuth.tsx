import { useEffect, useState } from 'react';
import {
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import useFireBase from './useFireBase';
import { App } from 'antd';
import useUser from './useUser';
import { User } from '../utils/auth.types';

export default function useAuth() {
  const { message } = App.useApp();
  const { firebaseAuth } = useFireBase();
  const { setUser, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Initialize recaptcha verifier
  useEffect(() => {
    try {
      if (!document.getElementById('recaptcha-container')) {
        const container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
      }

      if (!recaptchaVerifier) {
        const verifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
          size: 'invisible',
        });
        setRecaptchaVerifier(verifier);

        return () => {
          verifier.clear();
          const container = document.getElementById('recaptcha-container');
          if (container) {
            container.remove();
          }
        };
      }
    } catch (error) {
      console.error('Error initializing recaptcha:', error);
    }
  }, [firebaseAuth, recaptchaVerifier]);

  async function firebaseLoginWithGoogle() {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      setLoading(false);
      return result;
    } catch {
      message.error('Error signing in with Google');
      setLoading(false);
    }
  }

  async function firebaseLoginWithPhone(phoneNumber: string) {
    if (!recaptchaVerifier) {
      message.error('Recaptcha not initialized');
      return;
    }

    setLoading(true);
    try {
      const confirmationResult = await signInWithPhoneNumber(
        firebaseAuth,
        phoneNumber,
        recaptchaVerifier
      );
      setLoading(false);
      return confirmationResult;
    } catch {
      message.error('Error signing in with phone number');
      setLoading(false);
    }
  }

  async function firebaseLoginAnonymously() {
    setLoading(true);
    try {
      const result = await signInAnonymously(firebaseAuth);
      setLoading(false);
      return result;
    } catch {
      message.error('Error signing in anonymously');
      setLoading(false);
    }
  }

  const firebaseLogout = () => {
    setUser(null);
    return signOut(firebaseAuth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async currentUser => {
      setLoading(true);
      if (currentUser) {
        const { displayName, email, phoneNumber, uid, isAnonymous, providerData } = currentUser;

        const user: User = {
          uuid: uid,
          name: displayName,
          email: email || undefined,
          phone: phoneNumber || undefined,
          isAnonymous,
          providerType: (providerData[0]?.providerId === 'google.com'
            ? 'Google'
            : phoneNumber
            ? 'PhoneNumber'
            : isAnonymous
            ? 'Anonymous'
            : 'default') as User['providerType'],
          recipes: [],
        };

        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseAuth, setUser]);

  return {
    firebaseLoginWithGoogle,
    firebaseLogout,
    firebaseLoginWithPhone,
    firebaseLoginAnonymously,
    loading,
    user,
  };
}
