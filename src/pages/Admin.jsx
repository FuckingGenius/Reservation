import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const buttonStyle = {
  padding: "8px 16px",
  margin: "8px 0",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: "600",
  backgroundColor: "#3b82f6", // 파란색 (예약 확인하기 버튼과 동일)
  color: "white",
  width: "200px",
  fontSize: "16px",
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
};

const logoutButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#ef4444", // 빨간색 (로그아웃)
};

const containerStyle = {
  maxWidth: "400px",
  margin: "50px auto",
  textAlign: "center",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
};

const Admin = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin-login");
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "20px" }}>관리자 페이지</h2>
      <button style={buttonStyle} onClick={() => navigate("/admin/reservations")}>
        예약 내역 조회
      </button>
      <button style={buttonStyle} onClick={() => navigate("/admin/settings")}>
        예약 설정
      </button>
      <button style={logoutButtonStyle} onClick={handleLogout}>
        로그아웃
      </button>
    </div>
  );
};

export default Admin;
