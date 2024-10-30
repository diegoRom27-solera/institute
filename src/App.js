import logo from "./logo.svg";
import "./App.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import React, { useState, useEffect } from "react";
import axios from 'axios';
function App() {
  const [waitlist, setWaitlist] = useState([{}]);
  const [tables, setTables] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState("");
  const [notification, setNotification] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingWaitList, setLoadingWaitList] = useState(false);

  useEffect(() => {
    fetchWaitlist();

    fetchTables();
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setEmailError("Por favor ingrese un email válido");
      return false;
    }
    setEmailError("");
    return true;
  };

  const fetchWaitlist = async () => {
    setLoadingTables(true);
    try {
      const response = await fetch("https://jq8a9fbq8c.execute-api.us-east-1.amazonaws.com/prod/waitlist", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      setLoadingTables(false);
      if (!response.ok) throw new Error('Error al cargar los datos');
      const data = await response.json();
      const parsedData = JSON.parse(data.body);
      console.log(data.body);

      setWaitlist(parsedData); // Actualiza setWaitlist con los datos obtenidos
    } catch (error) {
      console.error("Error al cargar la lista de espera:", error);
    }
  };
  const fetchTables = async () => {
    setLoadingWaitList(true);
    try {
      const response = await fetch("https://jq8a9fbq8c.execute-api.us-east-1.amazonaws.com/prod/tables",{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setLoadingWaitList(false);

      if (!response.ok) throw new Error('Error al cargar los datos');
      const data = await response.json();
      const parsedData = JSON.parse(data.body);
      console.log(data.body);

      console.log(response);
      setTables(parsedData);
    } catch (error) {
      showNotification("Error al cargar las mesas disponibles", "error");
    }
  };

  const addToWaitlist = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    try {
      const response = await fetch("/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id:customerName,
          email:email,
          table_preference: partySize,
        }),
      });

      if (response.ok) {
        showNotification("Cliente agregado a la lista de espera", "success");
        setCustomerName("");
        setEmail("");
        setPartySize("");
        fetchWaitlist();
      } else {
        throw new Error("Error al agregar cliente");
      }
    } catch (error) {
      showNotification("Error al agregar cliente a la lista", "error");
    }
  };

  const notifyCustomer = async (customerId) => {
    try {
      const response = await fetch("/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId }),
      });

      if (response.ok) {
        showNotification("Cliente notificado exitosamente", "success");
        fetchWaitlist();
      } else {
        throw new Error("Error al notificar cliente");
      }
    } catch (error) {
      showNotification("Error al notificar al cliente", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="App">
      <div className="header">
        <div className="overlay">
          <h1>Bootcamp Institute</h1>
          <h2>Los pollos hermanos</h2>
        </div>
      </div>
      <div className="mainContainer">
        <div className="waitlist-container">
          {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}

          <div className="card form-card">
            <h2>Agregar a Lista de Espera</h2>
            <form onSubmit={addToWaitlist}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="input"
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  required
                  className={`input ${emailError ? "input-error" : ""}`}
                />
                {emailError && <p className="error-message">{emailError}</p>}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Preferencia"
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  required
                  min="1"
                  className="input"
                />
              </div>
              <button type="submit" className="button">
                Agregar a la Lista
              </button>
            </form>
          </div>

   
        </div>

        <div className="grid">
            <div className="card">
              <h2>Lista de Espera</h2>
              <div className="waitlist">
              {
  loadingTables ? (
    <p>Cargando...</p>
  ) : (
    waitlist.map((customer) => (
      <div key={customer.id} className="customer-card">
        <div className="customer-info">
          <h3>{customer.customerName}</h3>
          <p>{customer.email}</p>
          <p>Status {customer.status}</p>
        </div>
        <button
          onClick={() => notifyCustomer(customer.id)}
          className="button secondary"
        >
          Notificar
        </button>
      </div>
    ))
  )
}
              </div>
            </div>

            <div className="card">
              <h2>Mesas Disponibles</h2>
              <div className="tables">
              {
  loadingWaitList ? (
    <p>Cargando...</p>
  ) : (

                tables.map((table) => (
                  <div key={table.id} className="table-card">
                    <h3>Mesa #{table.table_id}</h3>
                    <p>Type {table.table_type} </p>
                    <p
                      className={`status ${
                        table.status ? "occupied" : "occupied"
                      }`}
                    >
                      {table.status ? "Ocupada" : "Ocupada"}
                    </p>
                  </div>
                )))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export default App;
