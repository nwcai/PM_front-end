import axios from 'axios';

const BASE_URL = "http://localhost:3000";

export const GetAllSensorByIdMachine = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/sensor/all/${id}`);
      //console.log("machine List:", response.data);
      return response.data;
    } catch (e) {
      console.error("Error fetching users from API:", e);
      throw e; // Re-throw the original error
    }
  };

  
export const GetAllSensorById = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/sensor/id/${id}`);
      //console.log("machine List:", response.data);
      return response.data;
    } catch (e) {
      console.error("Error fetching users from API:", e);
      throw e; // Re-throw the original error
    }
  };

export const CreateSensor = async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/sensor/create`, data, {
        headers: {
          'Authorization': `Bearer`,
          "ngrok-skip-browser-warning": "true"
        }
      });
      //console.log("machine List:", response.data);
      return response.data;
    } catch (e) {
      console.error("Error fetching users from API:", e);
      throw e; // Re-throw the original error
    }
  
};

export const UpdateSensor = async (id, data) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/sensor/update/${id}`, data, {
        headers: {
          'Authorization': `Bearer`,
          "ngrok-skip-browser-warning": "true"
        }
      });
      //console.log("machine List:", response.data);
      return response.data;
    } catch (e) {
      console.error("Error fetching users from API:", e);
      throw e; // Re-throw the original error
    }
};


export const DeleteSensor = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/sensor/delete/${id}`,{
        headers: {
          'Authorization': `Bearer`,
          "ngrok-skip-browser-warning": "true"
        }
      });
      //console.log("machine List:", response.data);
      return response.data;
    } catch (e) {
      console.error("Error fetching users from API:", e);
      throw e; // Re-throw the original error
    }
};