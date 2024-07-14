import React from "react";
import "./BookCard.css";

const BookCard = ({ book, daysRemaining = false }) => {
  return (
    <div className="book_card_container">
      {console.log(book)}
      <div className="book_card_item">
        <img
          src="http://books.google.com/books/content?id=yDB0tAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          alt=""
        />
      </div>
      <div className="book_card_item">
        <h4 className="blue_text">{book.title}</h4>
        <p className="blue_text">
          {book.author} | {book.year}
        </p>
        <p>{book.description.slice(0, 150)}...</p>
        {daysRemaining && (
          <span className="book_days_remaining">3 Days remaining</span>
        )}
      </div>
    </div>
  );
};

export default BookCard;
