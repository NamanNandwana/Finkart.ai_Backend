// app.js
const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const mysql = require("mysql");

const app = express();
const upload = multer({ dest: "uploads/" });

// Database connection
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "transactions_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

// API Endpoint for CSV upload
app.post("/upload-csv", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      results.forEach((transaction) => {
        const {
          TransactionID,
          CustomerName,
          TransactionDate,
          Amount,
          Status,
          InvoiceURL,
        } = transaction;
        const query =
          "INSERT INTO transactions (transaction_id, customer_name, transaction_date, amount, status, invoice_url) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(
          query,
          [
            TransactionID,
            CustomerName,
            TransactionDate,
            Amount,
            Status,
            InvoiceURL,
          ],
          (err) => {
            if (err) throw err;
          }
        );
      });
      fs.unlinkSync(filePath); // Clean up the uploaded file
      res.json({ message: "CSV data imported successfully!" });
    });
});

// Retrieve all transactions
app.get("/transactions", (req, res) => {
  const query = "SELECT * FROM transactions";
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Update a particular transaction by transaction_id
app.put("/transactions/:id", express.json(), (req, res) => {
  const transaction_id = req.params.id;
  const { customer_name, transaction_date, amount, status, invoice_url } =
    req.body;
  const query =
    "UPDATE transactions SET customer_name = ?, transaction_date = ?, amount = ?, status = ?, invoice_url = ? WHERE transaction_id = ?";
  db.query(
    query,
    [
      customer_name,
      transaction_date,
      amount,
      status,
      invoice_url,
      transaction_id,
    ],
    (err) => {
      if (err) throw err;
      res.json({ message: "Transaction updated successfully!" });
    }
  );
});
// Delete a particular transaction by transaction_id
app.delete("/transactions/:id", (req, res) => {
  const transaction_id = req.params.id;
  const query = "DELETE FROM transactions WHERE transaction_id = ?";

  db.query(query, [transaction_id], (err, results) => {
    if (err) {
      console.error("Error during DB operation:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.affectedRows === 0) {
      // No rows affected means no record was found with that ID
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully!" });
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log("Server running on port ${PORT}"));
