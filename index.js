let express=require('express')
require('dotenv').config();
let mongoose=require('mongoose')
let cors=require('cors')
const urt = require('./routes/userrt');
const Mongodb = require('./config/dbcon');
const irt = require('./routes/incomert');
const ert = require('./routes/expensert');
const dashrt = require('./routes/dashboardrt');


let app=express()


app.use(express.json())

app.use(cors({
  origin: [
    "https://expense-tracker-frnt.onrender.com",
    "http://localhost:5173"
  ],
  credentials: true
}));
app.use('/api/v1/auth',urt)
app.use('/api/v1/income',irt)
app.use('/api/v1/expense',ert)
app.use('/api/v1/dashboard',dashrt)



const PORT=process.env.PORT || 5000
Mongodb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });