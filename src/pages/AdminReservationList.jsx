import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

const containerStyle = {
  maxWidth: "900px",
  margin: "40px auto",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const buttonStyle = {
  padding: "6px 14px",
  marginRight: "8px",
  marginBottom: "8px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: "600",
  backgroundColor: "#3b82f6", // 예약 확인하기 버튼과 동일한 파란색
  color: "white",
  fontSize: "14px",
};

const inputStyle = {
  border: "1px solid #ccc",
  padding: "6px 10px",
  borderRadius: "4px",
  fontSize: "14px",
  marginRight: "8px",
};

const labelStyle = {
  marginRight: "8px",
  fontWeight: "600",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const thTdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};

const headerStyle = {
  backgroundColor: "#f3f4f6",
  fontWeight: "700",
};

const filterContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
};

const AdminReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      const snapshot = await getDocs(collection(db, "reservations"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReservations(data);
      setFilteredReservations(data);
    };

    fetchReservations();
  }, []);

  useEffect(() => {
    let filtered = [...reservations];

    if (filterDate) {
      filtered = filtered.filter((res) => res.date === filterDate);
    }

    if (searchTerm) {
      filtered = filtered.filter((res) =>
        `${res.name}${res.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) =>
      sortOrder === "asc"
        ? a.time.localeCompare(b.time)
        : b.time.localeCompare(a.time)
    );

    setFilteredReservations(filtered);
  }, [filterDate, sortOrder, searchTerm, reservations]);

  const handleTodayFilter = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setFilterDate(today);
  };

  const handleWeekFilter = () => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });

    const filtered = reservations.filter((res) => {
      const resDate = new Date(res.date);
      return isWithinInterval(resDate, { start, end });
    });

    const sorted = filtered.sort((a, b) =>
      sortOrder === "asc"
        ? a.time.localeCompare(b.time)
        : b.time.localeCompare(a.time)
    );

    setFilterDate("");
    setFilteredReservations(sorted);
  };

  const handleAllFilter = () => {
    setFilterDate("");
    setFilteredReservations(reservations);
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      ["날짜", "시간", "이름", "전화번호", "인원", "요청사항"],
      ...filteredReservations.map((res) => [
        res.date,
        res.time,
        res.name,
        res.phone,
        res.people,
        res.request || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "예약목록.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>예약 목록</h2>

      <div style={filterContainerStyle}>
        <button style={buttonStyle} onClick={handleDownloadCSV}>
          CSV 다운로드
        </button>

        <div>
          <label style={labelStyle}>날짜:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={inputStyle}
          />
          <button style={buttonStyle} onClick={handleTodayFilter}>
            오늘
          </button>
          <button style={buttonStyle} onClick={handleWeekFilter}>
            이번 주
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: "#6b7280" }} // 회색 버튼
            onClick={handleAllFilter}
          >
            전체
          </button>
        </div>

        <div>
          <label style={labelStyle}>정렬:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={inputStyle}
          >
            <option value="asc">시간 오름차순</option>
            <option value="desc">시간 내림차순</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>검색:</label>
          <input
            type="text"
            placeholder="이름 또는 전화번호"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <table style={tableStyle}>
        <thead style={headerStyle}>
          <tr>
            <th style={thTdStyle}>예약날짜</th>
            <th style={thTdStyle}>시간</th>
            <th style={thTdStyle}>이름</th>
            <th style={thTdStyle}>전화번호</th>
            <th style={thTdStyle}>인원수</th>
            <th style={thTdStyle}>요청사항</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.map((res) => (
            <tr key={res.id} style={{ cursor: "default" }}>
              <td style={thTdStyle}>{res.date}</td>
              <td style={thTdStyle}>{res.time}</td>
              <td style={thTdStyle}>{res.name}</td>
              <td style={thTdStyle}>{res.phone}</td>
              <td style={thTdStyle}>{res.people ?? "-"}</td>
              <td style={thTdStyle}>{res.request || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReservationList;
