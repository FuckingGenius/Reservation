import {React, useEffect} from "react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/login"); // 로그인 페이지로 리디렉션
    }
  }, [navigate]);
  return (
    <div>
      <h2>관리자 페이지</h2>
      <button onClick={() => navigate("/admin/reservations")}>예약 내역 조회</button>
      <button onClick={() => navigate("/admin/settings")}>예약 설정</button>
    </div>
  );
};

export default Admin;