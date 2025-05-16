
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, getDoc, addDoc, getDocs, query, where, doc  } from "firebase/firestore";

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
            
      const settingsRef = doc(db, "settings", "general");
      const settingsSnap = await getDoc(settingsRef);
      const settings = settingsSnap.data();

      const snapshot = await getDocs(
        query(collection(db, "reservations"),
          where("date", "==", form.date),
          where("time", "==", form.time)
        )
      );

      const existingReservations = snapshot.docs.map(doc => doc.data());
      const totalPeople = existingReservations.reduce((sum, r) => sum + Number(r.people), 0);
      const totalCount = existingReservations.length;

      if (totalPeople + Number(form.people) > settings.maxPeoplePerSlot) {
        alert("해당 시간의 인원 수가 초과되었습니다.");
        return;
      }

      if (totalCount >= settings.maxReservationsPerSlot) {
        alert("해당 시간의 예약 수가 초과되었습니다.");
        return;
      }


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
          <input name="phone" inputMode="numeric" pattern="\d*" value={form.phone} onChange={handleChange} required />
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
          <input type="number" min={1} name="people" value={form.people} onChange={handleChange} required />
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