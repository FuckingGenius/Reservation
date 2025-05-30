import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AdminSettings = () => {
  const [maxPeoplePerTimeSlot, setMaxPeoplePerTimeSlot] = useState(3);
  const [maxPeoplePerReservation, setMaxPeoplePerReservation] = useState(1);
  const [offDays, setOffDays] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState("");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [timeInterval, setTimeInterval] = useState(30);

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "reservationSettings");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaxPeoplePerTimeSlot(data.maxPeoplePerTimeSlot ?? 3);
        setMaxPeoplePerReservation(data.maxPeoplePerReservation ?? 1);
        setOffDays(data.offDays ?? []);
        setHolidays(data.holidays ?? []);
        setOpenTime(data.openTime ?? "09:00");
        setCloseTime(data.closeTime ?? "18:00");
        setTimeInterval(data.timeInterval ?? 30);
      }
    };
    fetchSettings();
  }, []);

  const handleCheckboxChange = (dayIndex) => {
    setOffDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleAddHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      setHolidays((prev) => [...prev, newHoliday]);
      setNewHoliday("");
    }
  };

  const handleRemoveHoliday = (date) => {
    setHolidays((prev) => prev.filter((d) => d !== date));
  };

  const handleSave = async () => {
    const settingsRef = doc(db, "settings", "reservationSettings");
    await setDoc(settingsRef, {
      maxPeoplePerTimeSlot,
      maxPeoplePerReservation,
      offDays,
      holidays,
      openTime,
      closeTime,
      timeInterval,
    });
    alert("설정이 저장되었습니다.");
  };

  return (
    <div>
      <h2>예약 설정</h2>

      <div>
        <label>시간당 최대 예약 인원 수: </label>
        <input
          type="number"
          min={1}
          value={maxPeoplePerTimeSlot}
          onChange={(e) => setMaxPeoplePerTimeSlot(Number(e.target.value))}
        />
      </div>

      <div>
        <label>한 예약당 최대 인원 수: </label>
        <input
          type="number"
          min={1}
          value={maxPeoplePerReservation}
          onChange={(e) => setMaxPeoplePerReservation(Number(e.target.value))}
        />
      </div>

      <div>
        <label>영업 시작 시간: </label>
        <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
      </div>

      <div>
        <label>영업 종료 시간: </label>
        <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
      </div>

      <div>
        <label>예약 시간 간격 (분): </label>
        <input
          type="number"
          min={5}
          step={5}
          value={timeInterval}
          onChange={(e) => setTimeInterval(Number(e.target.value))}
        />
      </div>

      <div>
        <p>고정 휴무 요일:</p>
        {daysOfWeek.map((day, idx) => (
          <label key={idx} style={{ marginRight: 10 }}>
            <input
              type="checkbox"
              checked={offDays.includes(idx)}
              onChange={() => handleCheckboxChange(idx)}
            />
            {day}
          </label>
        ))}
      </div>

      <div>
        <p>지정된 휴일 목록:</p>
        <input
          type="date"
          value={newHoliday}
          onChange={(e) => setNewHoliday(e.target.value)}
        />
        <button onClick={handleAddHoliday}>추가</button>
        <ul>
          {holidays.map((date) => (
            <li key={date}>
              {date}
              <button onClick={() => handleRemoveHoliday(date)} style={{ marginLeft: 10 }}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleSave}>설정 저장</button>
    </div>
  );
};

export default AdminSettings;
