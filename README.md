# Finkart.ai_Backend
Make a folder named ‘transactions'
npm init -y
npm install express mysql csv-parser multer
Run these two cmds
Create mysql db , with a database named as : transactions_db, and then run this sql query:
CREATE TABLE transactions (
  transaction_id VARCHAR(20) PRIMARY KEY,
  customer_name VARCHAR(255),
  transaction_date DATE,
  amount DECIMAL(10, 2),
  status VARCHAR(50),
  invoice_url TEXT
);
