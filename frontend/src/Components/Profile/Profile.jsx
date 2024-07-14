import React, { useState, useEffect } from "react";
import "./Profile.css";
import BookCard from "../BookCard/BookCard";
import PlaceIcon from "@mui/icons-material/Place";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { useAuth } from "../../context/AuthContext";
import { makePayment } from "./paymentHandler";
import { getToken, setToken } from "../../utils/common";
import axios from "axios";
import { BASEURL } from "../../utils/endpoint";

const Profile = () => {
  const { contextuser } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [overdue, setOverdue] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    const getProfile = async () => {
      const token = await getToken();
      console.log("token", token);
      let res = await axios.get(BASEURL + "api/get-profile-data", {
        headers: {
          "X-Firebase-AppCheck": `${token}`,
        },
      });
      setData(res.data.books);
      setOverdue(res.data.overdue);
      console.log("haaaaaaaaaaa : ", res.data.overdue);
    };

    getProfile();
  });

  const filteredData =
    data &&
    data.filter((book) =>
      book.title.toLowerCase().includes(searchText.toLowerCase())
    );

  const totalPages = filteredData
    ? Math.ceil(filteredData.length / itemsPerPage)
    : 0;

  const handleClickNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleClickPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData
    ? filteredData.slice(startIndex, startIndex + itemsPerPage)
    : [];

  return (
    <div className="profile_container">
      <div className="profile_item">
        <div className="profile_search">
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
        {data && (
          <>
            <div className="profile_my_books">
              <h1>My Books</h1>
              {currentData.map((book, key) => (
                <BookCard key={key} book={book} daysRemaining />
              ))}
            </div>
            <div className="pagination">
              <button
                className="top_nav_button"
                onClick={handleClickPrevious}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="top_nav_button"
                onClick={handleClickNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
      <div className="user_profile">
        <h1>User Profile</h1>
        <div className="user_profile_info">
          <div className="user_name">
            <img
              className="profile_pic"
              src={`https://ui-avatars.com/api/?name=${contextuser?.name}&background=fec701&color=000`}
              alt="profile pic"
            />
            <p>{contextuser?.name}</p>
          </div>
          <div className="user_info_item">
            <PlaceIcon className="user_profile_icon" />
            <p>{contextuser?.location}</p>
          </div>

          <div className="user_info_item">
            <EmailIcon className="user_profile_icon" />
            <p>{contextuser?.email}</p>
          </div>

          <div className="user_info_item">
            <p>
              Overdue Fees : <span> </span>
            </p>
            <p>Rs. {overdue}</p>
          </div>
          <button className="pay_fees_button" onClick={() => makePayment()}>
            Pay Overdue fees
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
