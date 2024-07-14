import React from "react";
import "./BookCard.css";

const BookCard = ({ book, daysRemaining = false, borrow = false }) => {
  const handleBorrow = () => {};
  return (
    <div className="book_card_container">
      {console.log(book)}
      <div className="book_card_item">
        <img src={book.imageLink} alt="" />
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
        {borrow && (
          <div className="book_tags">
            {book.quantity == 0 ? (
              <span className="sold_out">SOLD OUT</span>
            ) : (
              <span className="stock_count">{book.quantity} books left</span>
            )}
          </div>
        )}
      </div>

      {borrow && (
        <div className="borrow_book">
          <button className="top_nav_button" onClick={handleBorrow}>
            Borrow
          </button>
        </div>
      )}
    </div>
  );
};

export default BookCard;
