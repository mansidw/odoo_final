import React, { useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import { auth, provider } from "../../utils/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { setToken } from "../../utils/common";
import { Link } from "react-router-dom";


var empty_user = {
    email: "",
    password: "",
}
const Login = () => {
    const [user, setUser] = useState(empty_user);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
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

            console.log(result.user.displayName);
            console.log(result.user.email);
            console.log(result.user.uid);
        } catch (error) {
            console.log(error);
        }
    };

    const signInGoogle = async () => {
        try {
            let result = await signInWithPopup(auth, provider);
            setToken(await result.user.getIdToken());
            console.log(result.user.displayName);
            console.log(result.user.email);
            console.log(result.user.uid);
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
                    Don't have account? <Link to='/register'>Sign up</Link>
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
