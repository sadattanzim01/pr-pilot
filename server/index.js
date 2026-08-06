const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

//load .env file first before anything else so all process.env values are available
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

//import routes
const authRoutes = require('./routes/auth');
const webhookRoutes = require('./routes/webhook');
const apiRoutes = require('./routes/api');

//import db to trigger the connection check on startup
const pool = require('./services/db');

//allow the React frontend on port 3000 to make requests to this server
app.use(cors());

//parse incoming JSON request bodies
app.use(express.json());

//mount routes
app.use('/auth', authRoutes);       // GitHub OAuth: /auth/github, /auth/github/callback
app.use('/webhook', webhookRoutes); // GitHub webhooks: /webhook/github
app.use('/api', apiRoutes);         // Dashboard data: /api/reviews, /api/user

//health check — confirms the server is running
app.get('/', (req, res) => {
  res.json({ status: 'PR Pilot server is running 🚀' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});