import dotenv from 'dotenv';
import App from './app';

// Load environment variables
dotenv.config();

// Create and start the application
const app = new App();
app.listen(); 