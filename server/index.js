const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const webhookRoutes = require('./routes/webhook');
const pool = require('./services/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'PR Pilot server is running 🚀' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});