import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase"; // ✅ db 추가
import { doc, getDoc } from "firebase/firestore"; // ✅ Firestore 가져오기

import Home from "./pages/Home";
import AdminReservationList from "./pages/AdminReservationList";
import EditReservation from "./pages/EditReservation";
import AdminSettings from "./pages/AdminSettings";
import Admin from "./pages/Admin";
import Login from "./pages/login";
import Check from "./pages/ReservastionCheck";

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "settings", "adminList");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const allowed = docSnap.data().allowed || [];
            if (allowed.includes(currentUser.email)) {
              setUser(currentUser);
              alert("로그인 완료");
            } else {
              alert("권한이 없는 사용자입니다.");
              setUser(null);
            }
          } else {
            console.error("adminList 문서가 없습니다.");
            alert("관리자 설정 오류");
            setUser(null);
          }
        } catch (err) {
          console.error("관리자 확인 중 오류:", err);
          alert("관리자 확인 실패");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/reservations" element={<PrivateRoute><AdminReservationList /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/edit/:id" element={<EditReservation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/check" element={<Check />} />
      </Routes>
    </Router>
  );
}

export default App;
