import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const q = query(
        collection(db, "users"),
        where("employeeId", "==", employeeId),
        where("password", "==", password), // 해시하지 않았다면 단순 비교
        where("isAdmin", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        localStorage.setItem("isAdmin", "true");
        navigate("/admin"); // 관리자 페이지로 이동
      } else {
        alert("로그인 실패: 정보가 일치하지 않거나 관리자가 아닙니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>관리자 로그인</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>사번(ID): </label>
          <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
        </div>
        <div>
          <label>비밀번호: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login;