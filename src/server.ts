import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});