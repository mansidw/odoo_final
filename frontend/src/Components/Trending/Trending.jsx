import React, { useState } from "react";
import "../NewArrival/NewArrival.css";
import BookCard from "../BookCard/BookCard";

const Trending = () => {
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
    <div className="new_arrival_container">
      <h2 className="new_arrival_header">Trending</h2>
      {data.map((book, key) => {
        return <BookCard book={book} />;
      })}
    </div>
  );
};

export default Trending;
