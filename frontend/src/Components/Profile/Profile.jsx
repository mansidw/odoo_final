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
  const [data, setData] = useState([
    {
      author: "Harper Lee",
      borrow_count: 5,
      description:
        "A poignant novel that explores racial injustice and moral growth in the American South.",
      genre: "Fiction",
      imageLink:
        "http://books.google.com/books/content?id=B7fqAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9780061120084",
      publisher: "Harper Perennial Modern Classics",
      quantity: 0,
      timestamp: "2024-07-14",
      title: "To Kill a Mockingbird",
      year: "2006",
    },
    {
      author: "Cormac McCarthy",
      borrow_count: 6,
      description:
        "A post-apocalyptic novel about a father and son's journey through a barren and dangerous landscape.",
      genre: "Post-Apocalyptic",
      imageLink:
        "http://books.google.com/books/content?id=uFjYBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9780307277671",
      publisher: "Vintage",
      quantity: 9,
      timestamp: "2024-07-14",
      title: "The Road",
      year: "2006",
    },
    {
      author: "J.D. Salinger",
      borrow_count: 3,
      description:
        "A classic novel that explores teenage angst, alienation, and the search for identity.",
      genre: "Fiction",
      imageLink:
        "http://books.google.com/books/content?id=fSGKQgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9780316769488",
      publisher: "Little, Brown and Company",
      quantity: 5,
      timestamp: "2024-07-14",
      title: "The Catcher in the Rye",
      year: "1951",
    },
    {
      author: "Daniel Kahneman",
      borrow_count: 4,
      description:
        "A groundbreaking exploration of the two systems that drive the way we think: fast, intuitive thinking and slow, deliberate thinking.",
      genre: "Psychology",
      imageLink:
        "http://books.google.com/books/content?id=6hN2cQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9780374533557",
      publisher: "Farrar, Straus and Giroux",
      quantity: 6,
      timestamp: "2024-07-14",
      title: "Thinking, Fast and Slow",
      year: "2013",
    },
    {
      author: "Andy Weir",
      borrow_count: 8,
      description:
        "A thrilling science fiction novel about an astronaut stranded on Mars and his struggle for survival.",
      genre: "Science Fiction",
      imageLink:
        "http://books.google.com/books/content?id=4BfUngEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9780385537858",
      publisher: "Crown",
      quantity: 10,
      timestamp: "2024-07-14",
      title: "The Martian",
      year: "2014",
    },
    {
      author: "J.K. Rowling",
      borrow_count: 12,
      description:
        "The fourth installment in the beloved Harry Potter series, following Harry's adventures in his fourth year at Hogwarts.",
      genre: "Fantasy",
      imageLink:
        "http://books.google.com/books/content?id=7uw9PgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9780439139601",
      publisher: "Scholastic",
      quantity: 15,
      timestamp: "2024-07-14",
      title: "Harry Potter and the Goblet of Fire",
      year: "2002",
    },
    {
      author: "Frank Herbert",
      borrow_count: 10,
      description:
        "A classic science fiction masterpiece set in a distant future amidst political intrigue and desert planets.",
      genre: "Science Fiction",
      imageLink:
        "http://books.google.com/books/content?id=YyhzAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9780441013593",
      publisher: "Ace",
      quantity: 12,
      timestamp: "2024-07-14",
      title: "Dune",
      year: "2005",
    },
    {
      author: "Michelle Obama",
      borrow_count: 6,
      description:
        "An inspiring memoir by Michelle Obama, the former First Lady of the United States, reflecting on her journey and life experiences.",
      genre: "Memoir",
      imageLink:
        "http://books.google.com/books/content?id=3S1NDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9780525562144",
      publisher: "Crown Publishing Group",
      quantity: 9,
      timestamp: "2024-07-14",
      title: "Becoming",
      year: "2018",
    },
    {
      author: "Khaled Hosseini",
      borrow_count: 5,
      description:
        "A powerful and emotionally gripping story of friendship, betrayal, and redemption set in Afghanistan.",
      genre: "Historical Fiction",
      imageLink:
        "http://books.google.com/books/content?id=F0NStwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9780743273565",
      publisher: "Riverhead Books",
      quantity: 7,
      timestamp: "2024-07-14",
      title: "The Kite Runner",
      year: "2003",
    },
    {
      author: "Ta-Nehisi Coates",
      borrow_count: 4,
      description:
        "A profound letter to the author's son about the realities of being Black in America, exploring history, culture, and identity.",
      genre: "Nonfiction",
      imageLink:
        "http://books.google.com/books/content?id=z0PsBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9781101871277",
      publisher: "Spiegel & Grau",
      quantity: 6,
      timestamp: "2024-07-14",
      title: "Between the World and Me",
      year: "2015",
    },
    {
      author: "Douglas Crockford",
      borrow_count: 6,
      description:
        "An essential guide to JavaScript programming focusing on the good parts of the language for effective development.",
      genre: "Programming",
      imageLink:
        "http://books.google.com/books/content?id=cJGrAgAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9781449331818",
      publisher: "O'Reilly Media",
      quantity: 8,
      timestamp: "2024-07-14",
      title: "JavaScript: The Good Parts",
      year: "2008",
    },
    {
      author: "Walter Isaacson",
      borrow_count: 2,
      description:
        "An intimate biography of Steve Jobs, the visionary co-founder of Apple Inc., and his tumultuous journey in revolutionizing technology.",
      genre: "Biography",
      imageLink:
        "http://books.google.com/books/content?id=f0sAGjLh9DUC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9781451648539",
      publisher: "Simon & Schuster",
      quantity: 4,
      timestamp: "2024-07-14",
      title: "Steve Jobs",
      year: "2011",
    },
    {
      author: "Paula Hawkins",
      borrow_count: 6,
      description:
        "A gripping psychological thriller about obsession, deceit, and the secrets that unfold during a daily commute.",
      genre: "Thriller",
      imageLink:
        "http://books.google.com/books/content?id=nz4qDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9781501132933",
      publisher: "Riverhead Books",
      quantity: 8,
      timestamp: "2024-07-14",
      title: "The Girl on the Train",
      year: "2015",
    },
    {
      author: "Neil deGrasse Tyson",
      borrow_count: 7,
      description:
        "A concise and engaging overview of astrophysics and the universe for curious minds.",
      genre: "Science",
      imageLink:
        "http://books.google.com/books/content?id=3laSDAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9781594206115",
      publisher: "W. W. Norton & Company",
      quantity: 10,
      timestamp: "2024-07-14",
      title: "Astrophysics for People in a Hurry",
      year: "2017",
    },
    {
      author: "James Ma Weiming",
      borrow_count: 2,
      description:
        "Explore powerful Python finance libraries and apply them to develop quantitative applications.",
      genre: "Finance",
      imageLink:
        "http://books.google.com/books/content?id=kj1tDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
      isbn: "9781787123427",
      publisher: "Packt Publishing Ltd",
      quantity: 5,
      timestamp: "2024-07-14",
      title: "Mastering Python for Finance",
      year: "2018",
    },
    {
      author: "Matt Haig",
      borrow_count: 7,
      description:
        "A captivating story about regrets, second chances, and the choices that shape our lives.",
      genre: "Fantasy",
      imageLink:
        "http://books.google.com/books/content?id=kEf0DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
      isbn: "9781982158121",
      publisher: "Viking",
      quantity: 11,
      timestamp: "2024-07-14",
      title: "The Midnight Library",
      year: "2020",
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [overdue, setOverdue] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    async () => {
      const token = await getToken();
      console.log("token", token);
      let res = await axios.get(BASEURL + "api/get-profile-data", {
        headers: {
          "X-Firebase-AppCheck": `${token}`,
        },
      });
      console.log(res);
    };
  });

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
            <p>Overdue fees: </p>
            <p>Rs. 45</p>
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
