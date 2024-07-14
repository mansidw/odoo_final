import React, { useState } from "react";
import "./Profile.css";
import BookCard from "../BookCard/BookCard";
import PlaceIcon from "@mui/icons-material/Place";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

const Profile = () => {
  const [data, setData] = useState([
    {
      author: "Harper Lee",
      borrow_count: 1,
      description:
        "A poignant novel that explores racial injustice and moral growth in the American South.",
      genre: "Fiction",
      isbn: "9780061120084",
      publisher: "Harper Perennial Modern Classics",
      quantity: 6,
      timestamp: "2024-07-14",
      title: "To Kill a Mockingbird",
      year: "2006",
    },
    {
      author: "Yuval Noah Harari",
      borrow_count: 0,
      description:
        "A thought-provoking exploration of the history of humanity and our societal evolution.",
      genre: "History",
      isbn: "9780143128540",
      publisher: "Harper",
      quantity: 5,
      timestamp: "2024-07-14",
      title: "Sapiens: A Brief History of Humankind",
      year: "2015",
    },
  ]);
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
        <div className="profile_my_books">
          <h1>My Books</h1>
          {data.map((book, key) => {
            return <BookCard book={book} daysRemaining={true} />;
          })}
        </div>
      </div>
      <div className="user_profile">
        <h1>User Profile</h1>
        <div className="user_profile_info">
          <div className="user_name">
            <img
              className="profile_pic"
              src={`https://ui-avatars.com/api/?name=${"U"}&background=fec701&color=000`}
              alt="profile pic"
            />
            <p>Gaurav Parulekar</p>
          </div>
          <div className="user_info_item">
            <PlaceIcon className="user_profile_icon" />
            <p>hcwghckbwkcj jbiweivvbwic e7521dnssc nsdcvdbiwbdic</p>
          </div>
          <div className="user_info_item">
            <PhoneIcon className="user_profile_icon" />
            <p>9999999999</p>
          </div>
          <div className="user_info_item">
            <EmailIcon className="user_profile_icon" />
            <p>email@email.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
