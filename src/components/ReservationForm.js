import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDoc, addDoc, getDocs, query, where, doc } from "firebase/firestore";

const ReservationForm = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    people: "",
    request: "",
  });

  const [settings, setSettings] = useState(null);
  const [timeOptions, setTimeOptions] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const settingsRef = doc(db, "settings", "reservationSettings");
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setSettings(data);
        generateTimeOptions(data);
      }
    };
    fetchSettings();
  }, []);

  const generateTimeOptions = (config) => {
    const options = [];
    const [startHour, startMin] = config.openTime.split(":").map(Number);
    const [endHour, endMin] = config.closeTime.split(":").map(Number);
    const interval = config.timeInterval || 30;

    let current = new Date();
    current.setHours(startHour, startMin, 0, 0);
    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);

    while (current <= end) {
      const hh = String(current.getHours()).padStart(2, "0");
      const mm = String(current.getMinutes()).padStart(2, "0");
      options.push(`${hh}:${mm}`);
      current.setMinutes(current.getMinutes() + interval);
    }
    setTimeOptions(options);
  };

  const isDateDisabled = (dateStr) => {
    if (!settings) return false;
    const dateObj = new Date(dateStr);
    const day = dateObj.getDay();
    const isFixedOffDay = settings.offDays?.includes(day);
    const isHoliday = settings.holidays?.includes(dateStr);
    return isFixedOffDay || isHoliday;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // 날짜 유효성 검사 추가
    if (name === "date" && settings) {
      const selectedDate = new Date(value);
      const dayOfWeek = selectedDate.getDay(); // 0(일) ~ 6(토)
      const formatted = value; // 'YYYY-MM-DD'
  
      if (
        settings.offDays.includes(dayOfWeek) ||
        settings.holidays.includes(formatted)
      ) {
        alert("휴무일에는 예약이 불가능합니다.");
        return; // 날짜 선택 무시
      }
    }
  
    setForm({ ...form, [name]: value });
  };  

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (isDateDisabled(selectedDate)) {
      alert("선택하신 날짜는 휴무일입니다.");
      setForm({ ...form, date: "" });
    } else {
      setForm({ ...form, date: selectedDate });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!settings) return;

      const snapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("date", "==", form.date),
          where("time", "==", form.time)
        )
      );

      const existingReservations = snapshot.docs.map(doc => doc.data());
      const totalPeople = existingReservations.reduce((sum, r) => sum + Number(r.people), 0);
      const totalCount = existingReservations.length;

      if (totalPeople + Number(form.people) > settings.maxPeoplePerReservation) {
        alert("해당 시간의 인원 수가 초과되었습니다.");
        return;
      }

      if (totalCount >= settings.maxPeoplePerTimeSlot) {
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
          <input type="date" name="date" value={form.date} onChange={handleDateChange} required />
        </div>
        <div>
          <label>시간: </label>
          <select name="time" value={form.time} onChange={handleChange} required>
            <option value="">시간 선택</option>
            {timeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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