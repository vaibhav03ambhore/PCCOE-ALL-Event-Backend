import express from "express";
import cors from "cors";
import User from "./Models/user.js";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";

import eventRoutes from "./routes/eventRoutes.js";



const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';

dotenv.config()
const port = process.env.PORT || 3002
const DATABASE_URL = process.env.MONGODB_URI;

const app = express()
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));

connectDB(DATABASE_URL);
app.get('/', (req, res) => {
  res.send("this is the resposne at home route");
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          jwt.sign({
            email: user.email,
            id: user._id
          }, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json(user);
          });
        } else {
          res.json("Check Credentials")
        }
      } else {
        res.json("No Record Found")
      }
    })
});

app.post('/register', async (req, res) => {
  User.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))
});


app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);
      res.json({name,email,_id});
    });
  } else {

    res.json('user Info');
  }
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json(true);
});







app.use('/api/events',eventRoutes);

app.listen(port, () => {
  console.log("Server is Running on port ", port);
})