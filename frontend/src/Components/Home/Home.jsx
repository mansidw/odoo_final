import React, { useState } from "react";
import "./Home.css";
import NewArrival from "../NewArrival/NewArrival";
import Trending from "../Trending/Trending";
const Home = () => {
  const [searchText, setSearchText] = useState("");
  return (
    <div className="home_container">
      <div className="home_search_container">
        <h1>Search the books available in the library</h1>
        <div className="home_search_input">
          <input
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="Search books by names"
          />
          <button className="home_search_button">Search</button>
        </div>
      </div>
      <div className="home_explore">
        <NewArrival />
        <Trending />
      </div>
    </div>
  );
};

export default Home;
