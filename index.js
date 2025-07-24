require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'frnt_end')));

// CORS configuration
app.use(cors({
    origin: 'http://localhost:8080', // Adjust this to the correct frontend URL
    credentials: true // Allow cookies to be sent from the frontend
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("Error connecting to MongoDB:", err));


// User Schema (for authentication)
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Vote Schema (for wallet ID and reference number)
const voteSchema = new mongoose.Schema({
    walletId: String,
    refNo: String
});


const Vote = mongoose.model('Vote', voteSchema);

// Login Route
app.post('/login', async (req, res) => {
    console.log("Login request received:", req.body);

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user
        const user = await User.findOne({ username });

        // If user not found
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Create session token
        const token = bcrypt.hashSync(new Date().toString(), 8);

        // Set cookie
        res.cookie('auth', token, {
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log('Token Set:', token); // For debugging

        // Redirect to app.html after successful login
        res.status(200).json({ message: 'Login successful', redirect: '/app' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Registration Route
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'Registration successful' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Vote Route (for storing wallet ID and reference number)
app.post('/vote', async (req, res) => {
    const { walletId, refNo } = req.body;

    if (!walletId || !refNo) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the user already voted with the same walletId and refNo
        const existingVote = await Vote.findOne({ walletId, refNo });

        if (existingVote) {
            // If a vote already exists with this walletId and refNo, reject the request
            return res.status(400).json({ message: 'This wallet ID and reference number already voted' });
        }

        // Save the vote data if it's a new vote
        const vote = new Vote({
            walletId,
            refNo
        });

        await vote.save();

        // Respond to the user after successful vote submission
        res.status(200).json({ message: 'Vote submitted successfully', redirect: `/walletid/${walletId}` });
    } catch (error) {
        console.error('Vote submission error:', error);
        res.status(500).json({ message: 'Server error during vote submission' });
    }
});



// Wallet ID and Reference Number Validation Route
app.post('/validate-wallet', async (req, res) => {
    const { walletId, refNo } = req.body;

    // Check if both walletId and refNo are provided
    if (!walletId || !refNo) {
        return res.status(400).json({ status: 'error', message: 'Wallet ID and reference number are required.' });
    }

    try {
        // Query MongoDB for the matching walletId and refNo
        const wallet = await mongoose.connection.db.collection('wallets').findOne({ walletId: walletId, refNo: refNo });

        if (wallet) {
            // If found, return success
            return res.status(200).json({ status: 'success', message: 'Validation successful' });
        } else {
            // If not found, return failure
            return res.status(404).json({ status: 'error', message: 'Invalid wallet ID or reference number.' });
        }
    } catch (error) {
        console.error('Error during wallet validation:', error);
        return res.status(500).json({ status: 'error', message: 'An error occurred during validation.' });
    }
});

// Check Authentication Status
app.get('/checkAuth', (req, res) => {
    const token = req.cookies.auth;
    console.log('Cookie Token:', token); // For debugging
    if (token) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// App Route (Redirect to app.html after login)
app.get('/app', (req, res) => {
    const token = req.cookies.auth;
    if (token) {
        // If authenticated, serve app.html directly
        res.sendFile(path.join(__dirname, 'frnt_end', 'app.html'));
    } else {
        // If not authenticated, serve the login page
        res.sendFile(path.join(__dirname, 'frnt_end', 'index.html'));
    }
});

// Info Route
app.get('/info', async (req, res) => {
    const token = req.cookies.auth;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        const code = fs.readFileSync('Voting.sol').toString();

        const compiledCode = solc.compile(code);
        const abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface);
        const VotingContract = web3.eth.contract(abiDefinition);
        const byteCode = compiledCode.contracts[':Voting'].bytecode;
        const deployedContract = VotingContract.new(['Sanat', 'Aniket', 'Mandar', 'Akshay'], { data: byteCode, from: web3.eth.accounts[0], gas: 4700000 });

        const contractInstance = VotingContract.at(deployedContract.address);
        res.sendFile(path.join(__dirname, 'frnt_end', 'candidate.html'));
    } catch (error) {
        console.error('Error deploying contract:', error);
        res.status(500).json({ message: 'Error deploying contract' });
    }
});

// Wallet ID Page Route (after vote submission)
app.get('/walletid/:walletId', async (req, res) => {
    const { walletId } = req.params;

    try {
        const voteDetails = await Vote.findOne({ walletId });
        if (voteDetails) {
            // Render wallet ID page with vote details
            res.sendFile(path.join(__dirname, 'frnt_end', 'app.html'));
        } else {
            res.status(404).json({ message: 'Vote details not found' });
        }
    } catch (error) {
        console.error('Error fetching wallet ID details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});