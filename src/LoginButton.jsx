import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, provider, db } from './firebase';

export default function LoginButton() {
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      const userData = {
        uid: loggedInUser.uid,
        name: loggedInUser.displayName,
        email: loggedInUser.email,
        photoURL: loggedInUser.photoURL,
        lastLogin: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", loggedInUser.uid), userData, { merge: true });
      localStorage.setItem("msa_store_user", JSON.stringify(userData));

      setUser(userData);
      alert("تم تسجيل الدخول بنجاح وحفظ البيانات!");

    } catch (error) {
      console.error("حدث خطأ أثناء تسجيل الدخول:", error);
      alert("فشل تسجيل الدخول، حاول مرة أخرى.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {user ? (
        <div className="text-center">
          <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full mx-auto mb-2" />
          <h2 className="text-xl font-bold">أهلاً بك، {user.name}</h2>
          <p className="text-gray-400">{user.email}</p>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          تسجيل الدخول باستخدام Google
        </button>
      )}
    </div>
  );
}