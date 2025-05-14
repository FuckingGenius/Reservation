import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    const querySnapshot = await getDocs(collection(db, 'reservations'));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setReservations(data);
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
                <button onClick={() => alert("수정 기능은 곧 추가됩니다.")}>수정</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReservations;