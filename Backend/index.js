const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('AI Content Strategy Engine API is running!');
});

const trends = require('./routes/trends');
const strategy = require('./routes/strategy');
const competitors = require('./routes/competitors');
const auth = require('./routes/auth'); // <-- Import auth router

// Mount routers
app.use('/api/trends', trends);
app.use('/api/strategy', strategy);
app.use('/api/competitors', competitors);
app.use('/api/auth', auth);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});