const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema for the 'users' collection
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema, 'users'); // 'users' is the collection name

// Function to validate login credentials
async function validateLogin(username, password) {
  try {
    // Connect to the correct database (BLK)
    await mongoose.connect('mongodb://localhost/BLK', { useNewUrlParser: true, useUnifiedTopology: true });

    // Find user by username in the 'users' collection
    const user = await User.findOne({ username });

    if (!user) {
      return { status: 'error', message: 'Invalid username' };
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      return { status: 'success', message: 'Login successful', token: 'jwt_token' };
    } else {
      return { status: 'error', message: 'Invalid password' };
    }
  } catch (error) {
    return { status: 'error', message: 'An error occurred during validation' };
  } finally {
    // Close the database connection after the operation
    mongoose.connection.close();
  }
}
