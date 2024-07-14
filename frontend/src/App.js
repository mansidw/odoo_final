import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import TopNav from "./Components/TopNavbar/TopNav";
import Profile from "./Components/Profile/Profile";
import Explore from "./Components/Explore/Explore";
import Register from "./Components/signup/Register";
import Login from "./Components/signup/Login";
import UserDetails from "./Components/signup/UserDetails";
import { ToastContainer } from "react-toastify";
import Librarian from "./Components/Librarian/Librarian";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userdetails" element={<UserDetails />} />
        <Route path="/librarian" element={<Librarian />} />
      </Routes>
    </div>
  );
}

export default App;
