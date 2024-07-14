import React, { useState } from "react";
import { toast } from "react-toastify";
import "./Login.css";

import { auth, provider } from "../../utils/firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { getToken, setToken } from "../../utils/common";

var empty_user = {
  name: "",
  email: "",
  password: "",
};
const Register = () => {
  const [user, setUser] = useState(empty_user);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const signIn = async (e) => {
    e.preventDefault();
    setUser(empty_user);
    try {
      let result = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      await updateProfile(result.user, {
        displayName: user.name,
      });

      console.log(result);
      toast.success("Please provide above details", {
        position: "bottom-center",
      });
      navigate("/userdetails");
    } catch (error) {
      toast.error("Something went wrong", {
        position: "bottom-center",
      });
      console.log(error);
    }
  };

  const signInGoogle = async () => {
    try {
      let result = await signInWithPopup(auth, provider);
      console.log(result.user.displayName);
      console.log(result.user.email);
      console.log(result.user.uid);
      navigate("/userdetails");
      await setToken(await result.user.getIdToken());
      console.log(getToken())
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login_container">
      <div className="login">
        <img className="sidebar_logo" src="../../logo.png" alt="" />
        <input
          type="text"
          name="name"
          value={user.name}
          placeholder="Enter User"
          onChange={handleChange}
        />
        <input
          type="text"
          name="email"
          value={user.email}
          placeholder="Enter Email"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          value={user.password}
          placeholder="Enter password"
          onChange={handleChange}
        />
        <button className="login_button" onClick={signIn}>
          Register
        </button>
        <p className="register_text">
          Already have an account? <Link to="/login">Sign-in</Link>
        </p>
        <hr />
        <button className="login-with-google-btn" onClick={signInGoogle}>
          Continue With Google
        </button>
      </div>
    </div>
  );
};

export default Register;
