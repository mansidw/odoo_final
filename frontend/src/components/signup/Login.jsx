import React, { useContext, useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import { auth, provider } from "../../utils/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getToken, setToken } from "../../utils/common";
import axios from "axios";
import { BASEURL } from "../../utils/endpoint";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

var empty_user = {
    email: "",
    password: "",
};
const Login = () => {
    const [user, setUser] = useState(empty_user);
    const navigate = useNavigate();
    const { contextlogin } = useAuth();

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const getUser = async (email) => {
        try {
            const token = await getToken();
            console.log("token", token);
            console.log("email", email)
            let res;
            if (email) {

                res = await axios.get(BASEURL + "api/getuser?email=" + email, {
                    headers: {
                        "X-Firebase-AppCheck": `${token}`,
                    },
                });
            } else {
                res = await axios.get(BASEURL + "api/getuser", {
                    headers: {
                        "X-Firebase-AppCheck": `${token}`,
                    },
                });
            }
            console.log("get user done");
            console.log(res.data);
            contextlogin(res.data);
            toast.success("Login successfull", {
                position: "bottom-center",
            });
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong", {
                position: "bottom-center",
            });
        }
    };

    const signIn = async (e) => {
        e.preventDefault();
        setUser(empty_user);
        try {
            let result = await signInWithEmailAndPassword(
                auth,
                user.email,
                user.password
            );
            // setToken(await result.user.getIdToken());
            console.log("sign in done");
            getUser(user.email);
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong", {
                position: "bottom-center",
            });
        }
    };

    const signInGoogle = async () => {
        try {
            let result = await signInWithPopup(auth, provider);
            setToken(await result.user.getIdToken());
            console.log("oauth in done");
            getUser();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="login_container">
            <div className="login">
                <img className="sidebar_logo" src="./logo.png" alt="" />
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
                    Login
                </button>
                <p className="register_text">
                    Don't have account? <Link to="/register">Sign up</Link>
                </p>
                <hr />
                <button className="login-with-google-btn" onClick={signInGoogle}>
                    Continue With Google
                </button>
            </div>
        </div>
    );
};

export default Login;
