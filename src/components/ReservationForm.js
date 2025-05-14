
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const ReservationForm = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    people: "",
    request: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "reservations"), form);
      alert("예약이 완료되었습니다!");
      setForm({ name: "", phone: "", date: "", time: "", people: "", request: "" });
    } catch (error) {
      console.error("예약 저장 실패:", error);
      alert("예약 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>예약하기</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>이름: </label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>전화번호: </label>
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div>
          <label>날짜: </label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>
        <div>
          <label>시간: </label>
          <input type="time" name="time" value={form.time} onChange={handleChange} required />
        </div>
        <div>
          <label>인원 수: </label>
          <input type="number" name="people" value={form.people} onChange={handleChange} required />
        </div>
        <div>
          <label>요청사항: </label>
          <textarea name="request" value={form.request} onChange={handleChange} />
        </div>
        <button type="submit">예약하기</button>
      </form>
    </div>
  );
};

export default ReservationForm;