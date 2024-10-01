const express = require('express');
const bodyParser = require('body-parser'); // latest version of exressJS now comes with Body-Parser!
const bcrypt = require('bcrypt-nodejs');
const s3 = require('./s3.js');
const cors = require('cors');
const knex = require('knex');
const PORT = process.env.PORT || 5001;


const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const { HttpRequest } = require('aws-sdk');

// uri = "postgres://avnadmin:AVNS_He2AeIl9fa-_M4S5G1X@image-postgres-hackedc2-v1.i.aivencloud.com:24220/defaultdb?sslmode=require"
// conn = psycopg2.connect(uri)
// print(conn)
// cur = conn.cursor()
const db = knex({
  client: 'pg',
  connection: {
    host: 'relational-v2-hackedc2-v1.k.aivencloud.com', // Hostname of your PostgreSQL server
    user: 'avnadmin', // PostgreSQL username
    password: '-', // PostgreSQL password
    database: 'defaultdb', // PostgreSQL database name
    port: 24220, // Port of your PostgreSQL server
    ssl: { // SSL configuration (since sslmode=require is used)
      require: true,
      rejectUnauthorized: false // To bypass SSL certificate validation (useful for self-signed certificates)
    }
  }
});
// 

const app = express();
app.use(express.json()); 
app.use(cors({
  origin:"http://localhost:3000"
}));

app.get('/s3Url', async (req, res) => {
  try {
    const url = await s3.generateUploadURL();
    res.send({ url });
  } catch (error) {
    console.error('Error generating S3 URL:', error);
    res.status(500).send('Error generating S3 URL');
  }
});


app.get('/', (req, res)=> { res.send(db.users) })
app.post('/signin', signin.handleSignin(db, bcrypt))
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db)})
app.put('/image', (req, res) => { image.handleImage(req, res, db)})
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res)})
// New endpoint to fetch events
app.get('/api/events', async (req, res) => {
  try {
    const events = await db.select('event_name', 'event_owner','created_on').from('event_table');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
});
app.get('/test-db', async (req, res) => {
  try {
    const users = await db.select('*').from('register_table');
    res.json(users);
  } catch (err) {
    console.error('Error connecting to database:', err);
    res.status(500).json('Database connection failed');
  }
});

app.post('/test-register', async (req, res) => {
  const { name, email, mobile, password, imageUrl } = req.body;
  
  if (!name || !email || !mobile || !password || !imageUrl) {
    return res.status(400).json('Incomplete registration details');
  }

  const hash = bcrypt.hashSync(password);
  
  try {
    const user = await db('register_table')
      .insert({
        user_name: name,
        user_email: email,
        mobile: mobile,
        password: hash,
        created_on: new Date(),
        photo_url: imageUrl
      })
      .returning('*');
    
    res.json(user[0]);
  } catch (err) {
    console.error('Error during insert:', err);
    res.status(400).json('Unable to register');
  }
});
// New endpoint to save event details
app.post('/saveevent', async (req, res) => {
  const { event_name, email_id, event_owner, event_id } = req.body;

  try {
    await db('event_table').insert({
      event_name,
      email_id,
      event_owner,
      event_id,
      created_on: new Date() // Assuming there's a `created_on` column to store the timestamp
    });

    res.status(200).json({ message: 'Event saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving event', error });
  }
});

app.listen(PORT,()=>{
  console.log(`running on ${PORT}`);
})
