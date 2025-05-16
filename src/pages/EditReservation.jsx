import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const EditReservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservation = location.state;

  const [formData, setFormData] = useState({
    name: reservation.name || "",
    phone: reservation.phone || "",
    date: reservation.date || "",
    time: reservation.time || "",
    people: reservation.people || "",
    request: reservation.request || ""
  });
  console.log("reservation.requests: ", formData.request);
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reservationRef = doc(db, "reservations", reservation.id);
    await updateDoc(reservationRef, formData);
    alert("예약 정보가 수정되었습니다.");
    navigate("/admin");
  };

  return (
    <div>
      <h2>예약 정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="이름"
          required
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="전화번호"
          required
        />
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <input
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
        <input
          name="people"
          type="number"
          value={formData.people}
          onChange={handleChange}
          placeholder="인원 수"
          required
        />
        <textarea
          name="request"
          value={formData.request}
          onChange={handleChange}
          placeholder="요청사항"
        />
        <button type="submit">수정 완료</button>
      </form>
    </div>
  );
};

export default EditReservation;