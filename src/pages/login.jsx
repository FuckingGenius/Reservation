import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/admin");
    } catch (error) {
      console.error("구글 로그인 에러:", error);
      alert("로그인 실패");
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f0f2f5",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    title: {
      marginBottom: 24,
      fontSize: 28,
      color: "#333",
    },
    button: {
      backgroundColor: "#4285F4",
      color: "white",
      border: "none",
      padding: "12px 24px",
      borderRadius: 4,
      fontSize: 16,
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(66, 133, 244, 0.4)",
      transition: "background-color 0.3s ease",
    },
    buttonHover: {
      backgroundColor: "#357ae8",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>로그인</h2>
      <button
        style={styles.button}
        onClick={handleGoogleLogin}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = "#357ae8")}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = "#4285F4")}
      >
        Google로 로그인
      </button>
    </div>
  );
};

export default Login;
