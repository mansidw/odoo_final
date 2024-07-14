import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "./Librarian.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const acceptButton = (props) => {
  const updateStatus = async (event) => {
    console.log(props);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/update_transaction_status",
        {
          transaction_id: props.data.transaction_id,
        }
      );
      console.log(response.data);
      setData(response.data);
      toast.success("Approved", {
        position: "bottom-center",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Something went wrong", {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="lib_buttons">
      <button class="accept_button" onClick={updateStatus}>
        Accept
      </button>
      <button class="accept_button red_button">Reject</button>
    </div>
  );
};

const Librarian = () => {
  const { contextuser } = useAuth();
  const navigate = useNavigate();
  const [colDefs, setColDefs] = useState([
    { field: "book_name", filter: "agTextColumnFilter", flex: 1 },
    { field: "user_id", filter: "agTextColumnFilter", flex: 1 },
    { field: "due_date", filter: "agTextColumnFilter", flex: 1 },
    { field: "late_fees", filter: "agTextColumnFilter" },
    { field: "status" },
    {
      filter: "agTextColumnFilter",
      cellRenderer: acceptButton,
      flex: 4,
    },
  ]);

  const frameworkComponents = {
    dropdownCellRenderer: acceptButton,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000//api/fetch_submitted_transactions"
        );
        console.log(response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const [data, setData] = useState();
  return (
    <div className="librarian_container">
      <div
        className="ag-theme-quartz"
        style={{ width: "90%", margin: "auto", height: 500, marginTop: 50 }}
      >
        <AgGridReact rowData={data} columnDefs={colDefs} pagination={true} />
      </div>
    </div>
  );
};

export default Librarian;
