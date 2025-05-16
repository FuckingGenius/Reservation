import React from "react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>관리자 페이지</h2>
      <button onClick={() => navigate("/admin/reservations")}>예약 내역 조회</button>
      <button onClick={() => navigate("/admin/settings")}>예약 설정</button>
    </div>
  );
};

export default Admin;