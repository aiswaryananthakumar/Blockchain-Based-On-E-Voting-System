# Project Setup Guide

This guide will walk you through the steps to set up and run the project.

## Prerequisites

- MongoDB Compass installed on your machine.

## Setup Instructions

1. **Install MongoDB Compass**
   - Download and install MongoDB Compass from the [official MongoDB website](https://www.mongodb.com/try/download/compass).

2. **Create a Connection**
   - Open MongoDB Compass.
   - Create a new connection named `BLK`.

3. **Create a Database**
   - Within the `BLK` connection, create a new database named `BLK`.

4. **Import the Collection**
   - Import the `BLK.wallets` collection into the `BLK` database.

5. **Complete Other Steps**
   - Follow all other standard setup steps as usual.

6. **Register on First Launch**
   - On the first launch of the application using `node index.js`, you will need to register.

7. **Log In**
   - After registration, log in using the credentials you registered with.

8. **Use WalletID and RefNo**
   - Use the following details from the `wallets` collection:
     - `walletID`: `0x9876543210abcdef1234567890abcdef12345678`
     - `refNo`: `VOTE123456`

## Upgrade Notice

**Note:** This project is currently being upgraded to detect duplicate `walletID`s and `refNo`s. This feature is a work in progress.

---
