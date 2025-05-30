import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const styles = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#333",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    outline: "none",
    boxSizing: "border-box",
  },
  button_edit :{
    width: "40%",
    padding: "10px 0",
    fontSize: "1.1rem",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
  },
  button_delete :{
    width: "40%",
    padding: "10px 0",
    fontSize: "1.1rem",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
  },
  button: {
    width: "100%",
    padding: "10px 0",
    fontSize: "1.1rem",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  resultList: {
    marginTop: "25px",
    listStyleType: "none",
    paddingLeft: "0",
  },
  resultItem: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    color: "#444",
  },
  noResult: {
    marginTop: "20px",
    textAlign: "center",
    color: "#777",
  },
};


const ReservationCheck = () => {

  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm("예약을 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "reservations", id));
        alert("예약이 삭제되었습니다.");
        setResults(results.filter(r => r.id !== id));
      } catch (error) {
        console.error("예약 삭제 실패:", error);
        alert("예약 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleSearch = async () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }else{
      let q;
      if (phone) {
        q = query(
          collection(db, "reservations"),
          where("name", "==", name.trim()),
          where("phone", "==", phone.trim())
        );
      } else {
        q = query(
          collection(db, "reservations"),
          where("name", "==", name.trim())
        );
      }
    }

    setLoading(true);
    try {
      const reservationsRef = collection(db, "reservations");
      const q = phone.trim()
        ? query(reservationsRef, where("name", "==", name.trim()), where("phone", "==", phone.trim()))
        : query(reservationsRef, where("name", "==", name.trim()));

      const snapshot = await getDocs(q);
      setResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("예약 조회 실패:", error);
      alert("예약 조회 중 오류가 발생했습니다.");
    }
    setLoading(false);
  };

  const promptAuthAndEdit = (id, realKey) => {
    const input = prompt("예약 코드를 입력하세요");
    if (input === realKey) {
      navigate(`/edit/${id}?authKey=${realKey}`);
    } else {
      alert("예약 코드가 일치하지 않습니다.");
    }
  };

  const promptAuthAndDelete = (id, realKey) => {
    const input = prompt("예약 코드를 입력하세요");
    if (input === realKey) {
      // 삭제 처리 코드
    } else {
      alert("예약 코드가 일치하지 않습니다.");
    }
  };


  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>예약 확인</h2>
      <div style={styles.formGroup}>
        <label style={styles.label}>이름</label>
        <input
          type="text"
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          required
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>전화번호 (선택)</label>
        <input
          type="text"
          style={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호를 입력하세요"
        />
      </div>
      <button style={styles.button} onClick={handleSearch} disabled={loading}>
        {loading ? "조회중..." : "검색"}
      </button>

      {results.length > 0 ? (
        <ul style={styles.resultList}>
          {results.map((r) => (
            <li key={r.id} style={styles.resultItem}>
              이름 : {r.name} <br /> 전화번호 : {r.phone} <br/>
              날짜: {r.date} <br /> 시간: {r.time} <br /> 인원: {r.people}명
              <br />
              요청사항: {r.request || "없음"}
              <li></li>
              예약코드 : {r.authKey}
              <br/> <br/>
              <button style={styles.button_edit} onClick={() => promptAuthAndEdit(r.id, r.authKey)}>수정</button>
              <button style={styles.button_delete} onClick={() => promptAuthAndDelete(r.id, r.authKey)}>삭제</button>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p style={styles.noResult}>예약 내역이 없습니다.</p>
      )}
    </div>
  );
};

export default ReservationCheck;
