import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminReservationList from "./pages/AdminReservationList";
import EditReservation from "./pages/EditReservation";
import AdminSettings from "./pages/AdminSettings";
import Admin from "./pages/Admin";

// 예시 (React Router v6 기준)
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/reservation" element={<AdminReservationList />} />
        <Route path="/edit/:id" element={<EditReservation />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;