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

export const GetSensorData = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/sensor/data/${id}`, {
      headers: {
        'Authorization': `Bearer`,
        "ngrok-skip-browser-warning": "true"
      }
    });
    return response.data;
  } catch (e) {
    console.error("Error fetching sensor data from API:", e);
    throw e; // Re-throw the original error
  }
};

export const CreateSensorData = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/sensor/create_data`, data, {
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

export const FetchAndSaveSensors = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/sensor/fetch-and-save-sensors`);
        console.log('Sensors fetched and saved:', response.data);
    } catch (error) {
        console.error('Error fetching and saving sensors:', error);
    }
};

/////////Korawit////////

const BASE_Korawit_URL = "http://Korawit.ddns.net:6060";

export const KorawitGetAllSensorByIdMachine = async (id) => {
    try {
      const response = await axios.get(`${BASE_Korawit_URL}/sensors`,{
        headers: {
         "Api-Key":"6e9caa8a-503a-4602-b577-84f2f0c776bd"
          
        }
      })
      //console.log("machine List:", response.data);
      return response.data;

    } catch (e) {
      console.error("Error fetching users from API:", e);
      throw e; // Re-throw the original error
    }
    
  };

