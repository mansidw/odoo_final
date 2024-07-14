import React, { useState, useEffect} from "react";
import "./NewArrival.css";
import BookCard from "../BookCard/BookCard";
import axios from 'axios';

const NewArrival = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/new_arrivals');
        console.log(response.data)
        setData(response.data.books);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="new_arrival_container">
      <h2 className="new_arrival_header">New Arrivals</h2>
      {data.map((book, key) => {
        return <BookCard book={book} />;
      })}
    </div>
  );
};

export default NewArrival;
