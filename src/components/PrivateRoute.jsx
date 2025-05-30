import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // 경로는 네 프로젝트 구조에 따라 조정

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 🔒 여기서 관리자 이메일만 허용 (원하면 리스트로도 가능)
      if (user && user.email === "iknowmyway@gmail.com") {
        setUser(user);
      } else {
        setUser(null); // 로그인은 됐어도 권한 없으면 접근 막음
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;