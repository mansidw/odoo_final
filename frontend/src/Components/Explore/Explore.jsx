import React, { useEffect, useState } from "react";
import BookCard from "../BookCard/BookCard";
import "./Explore.css";
import axios from "axios";

const Explore = () => {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredData = data.filter((book) =>
    book.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/searchAll");
        console.log(response.data.books);
        setData(response.data.books);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="explore_container">
      <div className="explore_search_container">
        <h1>Search the books available in the library</h1>
        <div className="home_search_input">
          <input
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="Search books by titles"
          />
        </div>
        <div className="home_search_book">
          {currentData.map((book, key) => (
            <BookCard key={key} book={book} borrow />
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
      </div>
    </div>
  );
};

export default Explore;
