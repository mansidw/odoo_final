import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../utils/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [contextuser, setContextUser] = useState(() => {
    const storedUser = localStorage.getItem("contextuser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    console.log("auth-context user");
    console.log(contextuser);
    if (user) {
      localStorage.setItem("contextuser", JSON.stringify(contextuser));
    } else {
      console.log("user removed for localstorage");
      localStorage.removeItem("contextuser");
    }
  });

  const contextlogin = (userData) => {
    setContextUser(userData);
    console.log("saved in localstorage");
    localStorage.setItem("contextuser", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setContextUser(null);
      toast.success("Logged out successfully", {
        position: "bottom-center",
      });
    } catch (err) {
      console.error(err);
      localStorage.removeItem("contextuser");
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{ contextuser, contextlogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
