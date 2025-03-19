import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const GetAllUser = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/user/all`);
    console.log("User List:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }
};

export const GetUserById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/user/id/${id}`);
    console.log("User List:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }
};


export const CreateUser  = async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/user/create`, data, {
        headers: {
          'Authorization': `Bearer`,
          "ngrok-skip-browser-warning": "true"
        },
      });
      return response.data.user;
    } catch (error) {
      // Check if the error response has a 401 status code
      if (error.response && error.response.status === 401) {
        throw new Error('บัญชีนี้มึอยู่แล้ว'); // Duplicate data error message
      } else {
        console.error('Error UserRegister:', error);
        throw new Error(error.message || 'An error occurred');
      }
    }
  };

  export const UpdateUser  = async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/user/update/${data.id}`, data, {
        headers: {
          'Authorization': `Bearer`,
          "ngrok-skip-browser-warning": "true"
        },
      });
      return response.data.user;
    } catch (error) {
      // Check if the error response has a 401 status code
      if (error.response && error.response.status === 401) {
        throw new Error('บัญชีนี้มึอยู่แล้ว'); // Duplicate data error message
      } else {
        console.error('Error UserRegister:', error);
        throw new Error(error.message || 'An error occurred');
      }
    }
  };

  export const Login = async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/user/login`, data,{
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
      });
      return response.data;
    } catch (error) {
      // Check if the error response has a 401 status code
      if (error.response && error.response.status === 401) {
        throw new Error('บัญชีนี้มึอยู่แล้ว'); // Duplicate data error message
      } else {
        console.error('Error UserRegister:', error);
        throw new Error(error.message || 'An error occurred');
      }
    } 
  }