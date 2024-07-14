import React from "react";
import "./NewArrival.css";
import BookCard from "../BookCard/BookCard";

const NewArrival = () => {
  return (
    <div className="new_arrival_container">
      <h2 className="new_arrival_header">New Arrivals</h2>
      <BookCard />
      <BookCard />
      <BookCard />
      <BookCard />
    </div>
  );
};

export default NewArrival;
