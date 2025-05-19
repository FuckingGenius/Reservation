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
  const [timeInterval, setTimeInterval] = useState(30); // 기본값 30분

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "reservationSettings");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaxPeoplePerTimeSlot(data.maxPeoplePerTimeSlot || 3);
        setMaxPeoplePerReservation(data.maxPeoplePerReservation || 1);
        setOffDays(data.offDays || []);
        setHolidays(data.holidays || []);
        setOpenTime(data.openTime || "09:00");
        setCloseTime(data.closeTime || "18:00");
      }
    };
    fetchSettings();
  }, []);

  const handleCheckboxChange = (dayIndex) => {
    setOffDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
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
      timeInterval
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
          value={maxPeoplePerTimeSlot}
          onChange={(e) => setMaxPeoplePerTimeSlot(Number(e.target.value))}
          min={1}
        />
      </div>

      <div>
        <label>한 예약당 최대 인원 수: </label>
        <input
          type="number"
          value={maxPeoplePerReservation}
          onChange={(e) => setMaxPeoplePerReservation(Number(e.target.value))}
          min={1}
        />
      </div>

      <div>
        <label>영업 시작 시간: </label>
        <input
          type="time"
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
        />
      </div>

      <div>
        <label>영업 종료 시간: </label>
        <input
          type="time"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
        />
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
          <label key={idx} style={{ marginRight: "10px" }}>
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
              <button onClick={() => handleRemoveHoliday(date)} style={{ marginLeft: "10px" }}>
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

/*

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
*/