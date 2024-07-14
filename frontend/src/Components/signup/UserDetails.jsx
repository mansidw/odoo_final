import React, { useState } from "react";
import { toast } from "react-toastify";
import "./Login.css";
import { getToken } from "../../utils/common";
import axios from "axios";
import { BASEURL } from "../../utils/endpoint";

var empty_form = {
  age: "",
  location: "",
  gender: "",
  genre: "",
  author: "",
  type: "user",
};
const UserDetails = () => {
  const [form, setForm] = useState(empty_form);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let submitform = {
      age: form.age,
      location: form.location,
      gender: form.gender,
      genre: form.genre,
      author: form.author,
      type: "user",
    };
    console.log(submitform);
    setForm(empty_form);

    try {
      const token = await getToken();
      console.log("token", token);
      let res = await axios.post(BASEURL + "api/userdetails", submitform, {
        headers: {
          "X-Firebase-AppCheck": `${token}`,
        },
      });
      toast.success("Registered  successfull, Please login", {
        position: "bottom-center",
      });
      console.log(res.data);
    } catch (error) {
      toast.error("Something went wrong", {
        position: "bottom-center",
      });
      console.log(error);
    }
  };

  return (
    <div className="login_container">
      <div className="login">
        <img className="sidebar_logo" src="../../logo.png" alt="" />
        <input
          type="number"
          name="age"
          value={form.age}
          placeholder="Enter Age"
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          value={form.location}
          placeholder="Enter Location"
          onChange={handleChange}
        />
        <input
          type="text"
          name="gender"
          value={form.gender}
          placeholder="Enter Gender"
          onChange={handleChange}
        />
        <input
          type="text"
          name="genre"
          value={form.genre}
          placeholder="Your Preferred Genre"
          onChange={handleChange}
        />
        <input
          type="text"
          name="author"
          value={form.author}
          placeholder="Your Preferred Author"
          onChange={handleChange}
        />
        {/* <input
          type="text"
          name="type"
          value={form.type}
          placeholder="Admin/Librarian/User"
          onChange={handleChange}
        /> */}
        <button className="login_button" onClick={handleSubmit}>
          Submit Details
        </button>
      </div>
    </div>
  );
};

export default UserDetails;
