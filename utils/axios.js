// Import the Axios library
import axios from "axios";

// Create and export an Axios instance with a base URL of "http://localhost:5000"
export default axios.create({
  baseURL: "http://localhost:5000",
});
