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
  
    if (name === "date" && settings) {
      const selectedDate = new Date(value);
      const dayOfWeek = selectedDate.getDay();
      const formatted = value;
  
      if (
        settings.offDays.includes(dayOfWeek) ||
        settings.holidays.includes(formatted)
      ) {
        alert("휴무일에는 예약이 불가능합니다.");
        return;
      }
    }
  
    setForm({ ...form, [name]: value });
  };

  function generateReservationCode() {
    const now = new Date();
    const prefix = "A";
    const datePart = `${now.getMonth() + 1}${now.getDate()}`.padStart(4, "0");
    const randomPart = Math.floor(100 + Math.random() * 900); // 100~999
    return `${prefix}${datePart}${randomPart}`;
  }

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
      
      
    const authKey = generateReservationCode();
    const reservationData = { ...form, authKey };



      const existingReservations = snapshot.docs.map(doc => doc.data());
      const totalPeople = existingReservations.reduce((sum, r) => sum + Number(r.people), 0);
      const totalCount = existingReservations.length;

      if (totalPeople + Number(form.people) > settings.maxPeoplePerReservation+1) {
        alert("해당 시간의 인원 수가 초과되었습니다.");
        return;
      }

      if (totalCount >= settings.maxPeoplePerTimeSlot) {
        alert("해당 시간의 예약 수가 초과되었습니다.");
        return;
      }

      await addDoc(collection(db, "reservations"), reservationData);
      alert(`예약이 완료되었습니다! 예약 코드 : ${authKey}`);
      setForm({ name: "", phone: "", date: "", time: "", people: "", request: "" });
    } catch (error) {
      console.error("예약 저장 실패:", error);
      alert("예약 중 오류가 발생했습니다.");
    }
  };

  // 스타일 오브젝트
  const styles = {
    container: {
      maxWidth: "500px",
      margin: "40px auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    formGroup: {
      display: "flex",
      alignItems: "center",
      marginBottom: "20px",
    },
    label: {
      width: "100px",
      fontWeight: "600",
      fontSize: "1rem",
      color: "#333",
    },
    input: {
      flex: 1,
      padding: "8px 12px",
      fontSize: "1rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
      outline: "none",
    },
    textarea: {
      flex: 1,
      padding: "8px 12px",
      fontSize: "1rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
      outline: "none",
      resize: "vertical",
      minHeight: "80px",
    },
    button: {
      width: "100%",
      padding: "12px",
      fontSize: "1.1rem",
      backgroundColor: "#007BFF",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    buttonHover: {
      backgroundColor: "#0056b3",
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>예약하기</h2>
      <button type="button" onClick={() => window.location.href = "/check"}>
  예약 확인하기
</button>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>이름</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="홍길동"
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.label}>전화번호</label>
          <input
            id="phone"
            name="phone"
            inputMode="numeric"
            pattern="\d*"
            value={form.phone}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="01012345678"
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="date" style={styles.label}>날짜</label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleDateChange}
            required
            style={styles.input}
            min={new Date().toISOString().split("T")[0]} 
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="time" style={styles.label}>시간</label>
          <select
            id="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">시간 선택</option>
            {timeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="people" style={styles.label}>인원 수</label>
          <input
            type="number"
            min={1}
            id="people"
            name="people"
            value={form.people}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <div style={{ ...styles.formGroup, alignItems: "flex-start" }}>
          <label htmlFor="request" style={styles.label}>요청사항</label>
          <textarea
            id="request"
            name="request"
            value={form.request}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="기타 요청사항을 입력하세요"
          />
        </div>
        <button type="submit" style={styles.button}>예약하기</button>
      </form>
    </div>
  );
};

export default ReservationForm;
