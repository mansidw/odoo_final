import React from "react";
import "./BookCard.css";

const BookCard = () => {
  return (
    <div className="book_card_container">
      <div className="book_card_item">
        <img
          src="http://books.google.com/books/content?id=yDB0tAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"
          alt=""
        />
      </div>
      <div className="book_card_item">
        <h4>Odoo 10 Implementation Cookbook</h4>
        <p>Published Date: 2017-10-06</p>
        <p>Author: Mantavy Gajjar</p>
        <p>
          Comprehensive tasks covering Odoo 10 in the right wayAbout This Book*
          Reduce implementation costs and improve major benchmarks relating to
          storage space and speed.* Implement the approval hierarchy and user
          a...
        </p>
      </div>
    </div>
  );
};

export default BookCard;
