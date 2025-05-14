import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminReservationList from "./pages/AdminReservationList";
import EditReservation from "./pages/EditReservation";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminReservationList />} />
        <Route path="/edit/:id" element={<EditReservation />} />

      </Routes>
    </Router>
  );
}

export default App;