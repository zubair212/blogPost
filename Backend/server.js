const express = require('express');
const path = require('path');
const connectDB = require('./Database/index');
const { PORT, MONGODB_CONNECTION_STRING } = require('./Config/index');
const router = require('./routes/index');
const blogController = require('./controller/blogController');

const errorHandler = require('./middlewere/errorHandle');
const cookieParsel = require('cookie-parser');


const app = express();
app.use(cookieParsel());

const storageFolderPath = path.join(__dirname, 'storage');

// Use express.static middleware to serve static files from the "storage" folder
app.use('/storage', express.static(storageFolderPath));



app.use(express.json());
app.use(router);

app.use(errorHandler);

// Connect to MongoDB Atlas before starting the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}/`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process with an error code
  });
