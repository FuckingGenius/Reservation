import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const Admin = () => {
  const [reservations, setReservations] = useState([]);

const navigate = useNavigate();
  const fetchReservations = async () => {
    const querySnapshot = await getDocs(collection(db, 'reservations'));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setReservations(data);
  };

  const exportToExcel = () => {
    const filtered = reservations.map(res => ({
      이름: res.name,
      전화번호: typeof res.phone === "string" ? res.phone.replace(/[^0-9]/g, "") : "",
      날짜: res.date,
      시간: res.time,
      인원: typeof res.people === "number" ? res.people : parseInt(res.people) || "",
      요청사항: res.request || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "reservations.xlsx");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("정말로 이 예약을 삭제하시겠습니까?");
    if (confirmDelete) {
      await deleteDoc(doc(db, 'reservations', id));
      fetchReservations(); // 삭제 후 다시 불러오기
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>예약 목록</h2>
      <button onClick={exportToExcel}>엑셀로 내보내기</button>
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>전화번호</th>
            <th>날짜</th>
            <th>시간</th>
            <th>인원</th>
            <th>요청사항</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res.id}>
              <td>{res.name}</td>
              <td>{res.phone}</td>
              <td>{res.date}</td>
              <td>{res.time}</td>
              <td>{res.people}</td>
              <td>{res.request}</td>
              <td>
                <button onClick={() => handleDelete(res.id)}>삭제</button>
                <button onClick={() => navigate(`/edit/${res.id}`, { state: res })}>수정</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;