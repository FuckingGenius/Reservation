import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

function ReservationForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    people: 1,
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "reservations"), {
        ...formData,
        timestamp: Timestamp.now(),
      });
      setSuccess(true);
    } catch (error) {
      console.error("예약 실패:", error);
    }
  };

  if (success) {
    return <p>✅ 예약이 완료되었습니다!</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>📅 예약하기</h2>
      <div>
        <label>이름</label>
        <input type="text" name="name" required value={formData.name} onChange={handleChange} />
      </div>
      <div>
        <label>전화번호</label>
        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
      </div>
      <div>
        <label>날짜</label>
        <input type="date" name="date" required value={formData.date} onChange={handleChange} />
      </div>
      <div>
        <label>시간</label>
        <input type="time" name="time" required value={formData.time} onChange={handleChange} />
      </div>
      <div>
        <label>인원</label>
        <input type="number" name="people" min="1" max="20" required value={formData.people} onChange={handleChange} />
      </div>
      <button type="submit">예약하기</button>
    </form>
  );
}

export default ReservationForm;