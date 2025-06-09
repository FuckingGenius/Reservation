import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const EditReservation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const authKey = searchParams.get("authKey");
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(true);
  const [dateWarning, setDateWarning] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resRef = doc(db, "reservations", id);
      const settingsRef = doc(db, "settings", "reservationSettings");

      const [resSnap, settingsSnap] = await Promise.all([
        getDoc(resRef),
        getDoc(settingsRef),
      ]);

      if (!resSnap.exists()) {
        alert("예약 정보를 찾을 수 없습니다.");
        navigate("/");
        return;
      }

      const resData = resSnap.data();
      if (resData.authKey !== authKey) {
        alert("예약 코드가 일치하지 않습니다.");
        navigate("/");
        return;
      }

      setForm(resData);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setSettings(data);
        generateTimeOptions(data.openTime, data.closeTime, data.timeInterval);
      }
      setLoading(false);
    };

    fetchData();
  }, [id, authKey, navigate]);

  const generateTimeOptions = (start, end, interval) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    const result = [];

    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (startTime <= endTime) {
      const timeStr = startTime.toTimeString().slice(0, 5);
      result.push(timeStr);
      startTime.setMinutes(startTime.getMinutes() + interval);
    }

    setTimeOptions(result);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 날짜 선택 시 휴무일 경고 메시지 표시
  useEffect(() => {
    if (!form.date || !settings) return;

    const dateObj = new Date(form.date);
    const dayOfWeek = dateObj.getDay(); // 0 (일) ~ 6 (토)
    const isHoliday =
      settings.offDays?.includes(dayOfWeek) ||
      settings.holidays?.includes(form.date);

    if (isHoliday) {
      setDateWarning("⚠️ 선택하신 날짜는 휴무일입니다.");
    } else {
      setDateWarning("");
    }
  }, [form.date, settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!settings) return;

    const q = query(
      collection(db, "reservations"),
      where("date", "==", form.date),
      where("time", "==", form.time)
    );

    const snapshot = await getDocs(q);
    const otherReservations = snapshot.docs.filter(
      (docSnap) => docSnap.id !== id
    );
    const totalPeople = otherReservations.reduce(
      (sum, r) => sum + Number(r.data().people),
      0
    );

    // 인원 수 초과 검사
    if (
      settings.maxPeoplePerReservation &&
      totalPeople + Number(form.people) > settings.maxPeoplePerReservation
    ) {
      alert("해당 시간의 인원 수가 초과되었습니다.");
      return;
    }

    if (settings.maxPerSlot && otherReservations.length >= settings.maxPerSlot) {
      alert("해당 시간대는 이미 예약이 가득 찼습니다.");
      return;
    }

    // 과거 날짜 금지
    const today = new Date().toISOString().split("T")[0];
    if (form.date < today) {
      alert("과거 날짜로는 예약할 수 없습니다.");
      return;
    }

    // 휴무일 검사
    const dayOfWeek = new Date(form.date).getDay(); // 일(0)~토(6)
    const isHoliday =
      settings.offDays?.includes(dayOfWeek) ||
      settings.holidays?.includes(form.date);
    if (isHoliday) {
      alert("해당 날짜는 예약할 수 없습니다.");
      return;
    }

    // 영업 시간 검사
    if (form.time < settings.openTime || form.time > settings.closeTime) {
      alert(
        `예약 가능한 시간은 ${settings.openTime} ~ ${settings.closeTime} 입니다.`
      );
      return;
    }

    try {
      await updateDoc(doc(db, "reservations", id), form);
      alert("예약이 수정되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("예약 수정 실패:", error);
      alert("예약 수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>예약 정보 수정</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="이름"
          required
          style={styles.input}
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="전화번호"
          required
          style={styles.input}
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
          style={styles.input}
          min={new Date().toISOString().split("T")[0]}
        />
        <select
          name="time"
          value={form.time}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">시간 선택</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <input
          name="people"
          type="number"
          value={form.people}
          onChange={handleChange}
          placeholder="인원 수"
          required
          style={styles.input}
        />
        <textarea
          name="request"
          value={form.request}
          onChange={handleChange}
          placeholder="요청사항"
          style={styles.textarea}
        />
        {dateWarning && (
          <div style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>
            {dateWarning}
          </div>
        )}
        <button type="submit" style={styles.button}>
          수정 완료
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 480,
    margin: "30px auto",
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 10,
    backgroundColor: "#fafafa",
    fontFamily: "sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  textarea: {
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 16,
    minHeight: 80,
  },
  button: {
    padding: 12,
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    cursor: "pointer",
  },
};

export default EditReservation;
