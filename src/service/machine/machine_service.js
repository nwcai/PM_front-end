import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const GetAllMachines = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/machine/all`);
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
    console.log("API response:", response.data); // เพิ่มการแสดงผลข้อมูลที่ได้รับจาก API
    return response.data[0];
  } catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }
};

export const UpdateMachine = async (data, Id) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/machine/update/${Id}`, data, {
      headers: {
        'Authorization': `Bearer`,
        "ngrok-skip-browser-warning": "true"
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error UserRegister:", error);
    throw error;
}
};

export const DeleteMachinesById = async (Id) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/machine/delete/${Id}`);
    return response.data[0];
  } catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }
};

export const GetAllNameMechines = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/machine/allname`);
    return response.data;
  } 
  catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }
};

export const AddEvent = async (eventData) => {
  try {
    console.log("API Request URL:", `${BASE_URL}/api/machine/addevent`);
    console.log("API Request Data:", eventData);
    const response = await axios.post(`${BASE_URL}/api/machine/addevent`, eventData, {
      headers: {
        'Authorization': `Bearer`,
        "ngrok-skip-browser-warning": "true"
      },
    });
    return response.data;
  } catch (e) {
    console.error("Error fetching users from API:", e);
    throw e; // Re-throw the original error
  }

};

export const GetEventsById = async (id_event) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/machine/eventid/${id_event}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const GetEventsByMachineId = async (id_machine) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/machine/event/${id_machine}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const UpdateSensorState = async (sensorData) => {
  try {
    const response = await axios.post('/api/sensor/state', sensorData);
    return response.data;
  } catch (error) {
    console.error('Error updating sensor state:', error);
    throw error;
  }
};


export const AddRepair = async (RepairData) => {
  try {
    console.log("API Request URL:", `${BASE_URL}/api/machine/addrepair`);
    console.log("API Request Data:", RepairData); // Log the full object
    const response = await axios.post(`${BASE_URL}/api/machine/addrepair`, RepairData, {
      headers: {
        'Authorization': `Bearer`,
        "ngrok-skip-browser-warning": "true"
      },
    });
    return response.data;
  } catch (e) {
    console.error("Error adding repair:", e);
    throw e; // Re-throw the original error
  }
};
