import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    startTime: "11:00",
    endTime: "22:00",
    timeUnit: 30,
    maxPeoplePerTime: 6,
    maxReservationsPerSlot: 3,
    holidays: [],
    newHoliday: ""
  });

  const settingsRef = doc(db, "settings", "general"); // settings, general은 Firestore의 컬렉션 / 문서 이름

  useEffect(() => {
    const fetchSettings = async () => {
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists()) {
        setSettings((prev) => ({ ...prev, ...docSnap.data() }));
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "timeUnit" || name.includes("max") ? parseInt(value) : value
    }));
  };

  const addHoliday = () => {
    if (settings.newHoliday && !settings.holidays.includes(settings.newHoliday)) {
      setSettings((prev) => ({
        ...prev,
        holidays: [...prev.holidays, prev.newHoliday],
        newHoliday: ""
      }));
    }
  };

  const removeHoliday = (date) => {
    setSettings((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((d) => d !== date)
    }));
  };

  const saveSettings = async () => {
    await setDoc(settingsRef, {
      startTime: settings.startTime,
      endTime: settings.endTime,
      timeUnit: settings.timeUnit,
      maxPeoplePerTime: settings.maxPeoplePerTime,
      maxReservationsPerSlot: settings.maxReservationsPerSlot,
      holidays: settings.holidays
    });
    alert("설정이 저장되었습니다.");
  };

  return (
    <div>
      <h2>예약 설정</h2>
      <label>영업 시작 시간: </label>
      <input type="time" name="startTime" value={settings.startTime} onChange={handleChange} />

      <label>영업 종료 시간: </label>
      <input type="time" name="endTime" value={settings.endTime} onChange={handleChange} />

      <label>시간 단위 (분): </label>
      <select name="timeUnit" value={settings.timeUnit} onChange={handleChange}>
        <option value={15}>15분</option>
        <option value={30}>30분</option>
        <option value={60}>60분</option>
      </select>

      <label>타임당 최대 인원수: </label>
      <input type="number" name="maxPeoplePerTime" value={settings.maxPeoplePerTime} onChange={handleChange} />

      <label>타임당 최대 예약 건수: </label>
      <input type="number" name="maxReservationsPerSlot" value={settings.maxReservationsPerSlot} onChange={handleChange} />

      <h3>휴무일 설정</h3>
      <input type="date" name="newHoliday" value={settings.newHoliday} onChange={handleChange} />
      <button type="button" onClick={addHoliday}>추가</button>

      <ul>
        {settings.holidays.map((d) => (
          <li key={d}>
            {d} <button onClick={() => removeHoliday(d)}>삭제</button>
          </li>
        ))}
      </ul>

      <button onClick={saveSettings}>저장</button>
    </div>
  );
};

export default AdminSettings;