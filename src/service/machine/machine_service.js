import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const GetAllMachines = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/machine/all`);
    //console.log("machine List:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }
};

export const CreateMachine = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/machine/create`, data, {
      headers: {
        'Authorization': `Bearer`,
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
};

export const GetMachinesById = async (Id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/machine/id/${Id}`);
    //console.log("machine List:", response.data);
    return response.data[0];
  } catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }
};

export const UpdateMachine = async (data,Id) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/machine/update/${Id}`, data, {
      headers: {
        'Authorization': `Bearer`,
        "ngrok-skip-browser-warning": "true"
      },
    });
    return response.data;
  } catch (error) {
    // Check if the error response has a 401 status code
    if (error.response && error.response.status === 401) {
      throw new Error('เครื่องจักรนี้มึอยู่แล้ว'); // Duplicate data error message
    } else {
      console.error('Error UserRegister:', error);
      throw new Error(error.message || 'An error occurred');
    }
  }
};

export const DeleteMachinesById = async (Id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/machine/delete/${Id}`);
    //console.log("machine List:", response.data);
    return response.data[0];
  } catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }
};

export const GetAllNameMechines = async ()=>{
  try {
    const response = await axios.get(`${BASE_URL}/api/machine/allname`);
    //console.log("machine List:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }
}