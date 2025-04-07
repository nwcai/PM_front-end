import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Box,
  FormControl,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Sidebar from "../../component/sidebar";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

import { AlertError, AlertSuccess } from "../../component/alert";
import {
  CreateMachine,
  GetAllNameMechines,
  GetMachinesById,
  UpdateMachine,
} from "../../service/machine/machine_service";

import { TbPhotoSensor3 } from "react-icons/tb";
import { CreateSensor, GetAllSensorById, UpdateSensor, GetSensorData,CreateSensorData  } from "../../service/sensor/sensor_service";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
}));

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": {
      borderColor: "#2563eb",
    },
  },
});

const SensorForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, machine_id } = useParams();
  const [editState, setEditState] = useState(true);
  const [createState, setCreateState] = useState(true);
  const [sensorInfo, setsensorInfo] = useState({
    id_sensor: "",
    name: "",
    detail: "",
    note: "",
    severity: "",
    warning_vibration_x: "",
    warning_vibration_y: "",
    warning_vibration_z: "",
    warning_temp: "",
    critical_vibration_x: "",
    critical_vibration_y: "",
    critical_vibration_z: "",
    critical_temp: "",
  });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchSensorData = async () => {
      handleGetMechineName();
      try {
        if (location.pathname.includes("edit")) {
          setEditState(true);
          setCreateState(false);
          await handleGetSensorData();
        } else if (location.pathname.includes("view")) {
          setEditState(false);
          setCreateState(false);
          await handleGetSensorData();
        } else if (location.pathname.includes("create")) {
          setEditState(true);
          setCreateState(true);
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    };

    fetchSensorData();
  }, [location.pathname]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        console.log("Fetching chart data with id_sensor:", sensorInfo.id_sensor); // Log the id_sensor being used
        const data = await GetSensorData(sensorInfo.id_sensor);
        console.log("Fetched chart data:", data); // Log the fetched data

        // Transform the data to include timestamps
        if (Array.isArray(data) && data.length > 0) {
          const transformedData = data.map((item) => ({
            timestamp: item.create_date, // Use create_date as the timestamp
            temp: item.temp, // Use temp as the value
            vibration_x: item.vibration_x, // Use vibration_x as the value
            vibration_y: item.vibration_y, // Use vibration_y as the value
            vibration_z: item.vibration_z, // Use vibration_z as the value
          }));
          setChartData(transformedData);
        } else {
          console.error("Invalid data format:", data);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    if (sensorInfo.id_sensor) {
      fetchChartData();
    }
  }, [sensorInfo.id_sensor]);

  const handlesensorInfoChange = (field) => (event) => {
    setsensorInfo((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (createState) {
      let data = sensorInfo;
      data.id_machine = id;
      console.log("handle submit", data);
      await handleCreateSensor();
    } else {
      await handleUpdateSensor();
    }
  };

  const handleGetSensorData = async (e) => {
    try {
      const res = await GetAllSensorById(id);
      console.log(res[0]);
      setsensorInfo(res[0]);
    } catch (error) {
      console.error("handleGetSensorData", error);
    }
  };

  const handleGetMechineName = async (e) => {
    try {
      const res = await GetAllNameMechines();
      console.log("data", res);
    } catch (error) {
      console.error("handleGetMechineName", error);
    }
  };

  const handleCreateSensor = async () => {
    try {
      const res = await CreateSensor(sensorInfo);
      AlertSuccess();
      navigate(-1);
    } catch (error) {
      console.error("Error creating machine:", error);
      AlertError();
    }
  };

  const handleUpdateSensor = async () => {
    try {
      const res = await UpdateSensor(id, sensorInfo);
      AlertSuccess();
      navigate(-1);
    } catch (error) {
      console.error("Error creating machine:", error);
      AlertError();
    }
  };
  //********************************************************************************************************************************
  const handleAddSensorData = async (type) => {
    try {
      let data = {
        id_sensor: sensorInfo.id_sensor,
        vibration_x: 0,
        vibration_y: 0,
        vibration_z: 0,
        temp: 0,
      };

      // กำหนดค่าตามประเภท
      if (type === "good") {
        data.vibration_x = sensorInfo.warning_vibration_x - 1;
        data.vibration_y = sensorInfo.warning_vibration_y - 1;
        data.vibration_z = sensorInfo.warning_vibration_z - 1;
        data.temp = sensorInfo.warning_temp - 1;
      } else if (type === "warning") {
        data.vibration_x = sensorInfo.warning_vibration_x + 1;
        // data.vibration_y = sensorInfo.warning_vibration_y + 1;
        // data.vibration_z = sensorInfo.warning_vibration_z + 1;
        // data.temp = sensorInfo.warning_temp + 1;
      } else if (type === "critical") {
        data.vibration_x = sensorInfo.critical_vibration_x + 1;
        // data.vibration_y = sensorInfo.critical_vibration_y + 1;
        // data.vibration_z = sensorInfo.critical_vibration_z + 1;
        // data.temp = sensorInfo.critical_temp + 1;
      }

      // เรียก API เพื่อเพิ่มข้อมูล
      const res = await CreateSensorData(data); // ใช้ฟังก์ชัน API ที่เหมาะสม
      console.log("Data added:", res);
      AlertSuccess("Data added successfully!");
    } catch (error) {
      console.error("Error adding sensor data:", error);
      AlertError("Failed to add data!");
    }
  };
  //********************************************************************************************************************************
  const tempData = {
    labels: chartData
      ? chartData.slice(-50).map((item) => new Date(item.timestamp).toLocaleString())
      : [],
    datasets: [
      {
        label: "Temperature",
        data: chartData ? chartData.slice(-50).map((item) => item.temp) : [],
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "Warning Temperature",
        data: chartData ? chartData.slice(-50).map(() => sensorInfo.warning_temp) : [],
        fill: false,
        borderColor: "rgba(255, 165, 0, 0.5)",
        borderDash: [10, 5],
        pointRadius: 0,
      },
      {
        label: "Critical Temperature",
        data: chartData ? chartData.slice(-50).map(() => sensorInfo.critical_temp) : [],
        fill: false,
        borderColor: "rgba(255, 0, 0, 0.5)",
        borderDash: [10, 5],
        pointRadius: 0,
      },
    ],
  };
  
  const vibrationXData = {
    labels: chartData
      ? chartData.slice(-50).map((item) => new Date(item.timestamp).toLocaleString())
      : [],
    datasets: [
      {
        label: "Vibration X",
        data: chartData ? chartData.slice(-50).map((item) => item.vibration_x) : [],
        fill: false,
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Warning Vibration X",
        data: chartData ? chartData.slice(-50).map(() => sensorInfo.warning_vibration_x) : [],
        fill: false,
        borderColor: "rgba(255, 165, 0, 0.5)",
        borderDash: [10, 5],
        pointRadius: 0,
      },
      {
        label: "Critical Vibration X",
        data: chartData ? chartData.slice(-50).map(() => sensorInfo.critical_vibration_x) : [],
        fill: false,
        borderColor: "rgba(255, 0, 0, 0.5)",
        borderDash: [10, 5],
        pointRadius: 0,
      },
    ],
  };
  
  const vibrationYData = {
    labels: chartData
      ? chartData.slice(-50).map((item) => new Date(item.timestamp).toLocaleString())
      : [],
    datasets: [
      {
        label: "Vibration Y",
        data: chartData ? chartData.slice(-50).map((item) => item.vibration_y) : [],
        fill: false,
        backgroundColor: "rgb(54, 162, 235)",
        borderColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "Warning Vibration Y",
        data: chartData ? chartData.slice(-50).map(() => sensorInfo.warning_vibration_y) : [],
        fill: false,
        borderColor: "rgba(255, 165, 0, 0.5)",
        borderDash: [10, 5],
        pointRadius: 0,
      },
      {
        label: "Critical Vibration Y",
        data: chartData ? chartData.slice(-50).map(() => sensorInfo.critical_vibration_y) : [],
        fill: false,
        borderColor: "rgba(255, 0, 0, 0.5)",
        borderDash: [10, 5],
        pointRadius: 0,
      },
    ],
  };
  
  const vibrationZData = {
    labels: chartData
      ? chartData.slice(-50).map((item) => new Date(item.timestamp).toLocaleString())
      : [],
    datasets: [
      {
        label: "Vibration Z",
        data: chartData ? chartData.slice(-50).map((item) => item.vibration_z) : [],
        fill: false,
        backgroundColor: "rgb(255, 206, 86)",
        borderColor: "rgba(255, 206, 86, 0.2)",
      },
      {
        label: "Warning Vibration Z",
        data: chartData ? chartData.slice(-50).map(() => sensorInfo.warning_vibration_z) : [],
        fill: false,
        borderColor: "rgba(255, 165, 0, 0.5)",
        borderDash: [10, 5],
        pointRadius: 0,
      },
      {
        label: "Critical Vibration Z",
        data: chartData ? chartData.slice(-50).map(() => sensorInfo.critical_vibration_z) : [],
        fill: false,
        borderColor: "rgba(255, 0, 0, 0.5)",
        borderDash: [10, 5],
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sensor Data Line Chart",
      },
    },
    scales: {
      y: {
        beginAtZero: true, // เริ่มต้นที่ 0 บนแกน Y
      },
    },


  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8">
        <StyledCard elevation={3} className="w-full">
          <CardContent className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="font-semibold text-gray-800">
                ข้อมูลเซ็นเซอร์
              </Typography>
            </Box>

            <Divider className="mb-8" />

            <form onSubmit={handleSubmit} className="space-y-8 mt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    ID Sensor
                  </Typography>
                  <StyledTextField
                    required
                    value={sensorInfo.id_sensor}
                    onChange={handlesensorInfoChange("id_sensor")}
                    placeholder="กรุณากรอกรหัสเซ็นเซอร์"
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    ชื่อเซ็นเซอร์
                  </Typography>
                  <StyledTextField
                    required
                    value={sensorInfo.name}
                    onChange={handlesensorInfoChange("name")}
                    placeholder="กรุณากรอกชื่อเซ็นเซอร์"
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    รายละเอียด
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.detail}
                    onChange={handlesensorInfoChange("detail")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                    multiline
                    rows={3}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    หมายเหตุ
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.note}
                    onChange={handlesensorInfoChange("note")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                    multiline
                    rows={2}
                  />
                </FormControl>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    ระดับความรุนแรงในช่วงเฝ้าระวัง
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.warning_severity}
                    onChange={handlesensorInfoChange("warning_severity")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    ระดับความรุนแรงในช่วงวิกฤต
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.critical_severity}
                    onChange={handlesensorInfoChange("critical_severity")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Warning Vibration X
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.warning_vibration_x}
                    onChange={handlesensorInfoChange("warning_vibration_x")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Critical Vibration X
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.critical_vibration_x}
                    onChange={handlesensorInfoChange("critical_vibration_x")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Warning Vibration Y
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.warning_vibration_y}
                    onChange={handlesensorInfoChange("warning_vibration_y")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Critical Vibration Y
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.critical_vibration_y}
                    onChange={handlesensorInfoChange("critical_vibration_y")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Warning Vibration Z
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.warning_vibration_z}
                    onChange={handlesensorInfoChange("warning_vibration_z")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Critical Vibration Z
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.critical_vibration_z}
                    onChange={handlesensorInfoChange("critical_vibration_z")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Warning Temperature
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.warning_temp}
                    onChange={handlesensorInfoChange("warning_temp")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    Critical Temperature
                  </Typography>
                  <StyledTextField
                    value={sensorInfo.critical_temp}
                    onChange={handlesensorInfoChange("critical_temp")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>

              <div className="flex justify-end space-x-4 pt-8">
                <Button
                  variant="outlined"
                  className="w-32 md:w-40"
                  sx={{
                    mx: 2,
                    borderColor: "#94a3b8",
                    color: "#64748b",
                    "&:hover": {
                      borderColor: "#64748b",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                  onClick={(e) => navigate(-1)}
                >
                  กลับ
                </Button>

                {editState && (
                  <Button
                    variant="contained"
                    type="submit"
                    className="w-32 md:w-40"
                    sx={{
                      backgroundColor: "#2563eb",
                      "&:hover": {
                        backgroundColor: "#1d4ed8",
                      },
                    }}
                  >
                    บันทึก
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </StyledCard>
        <StyledCard sx={{ marginTop: 2 }}>
          <CardContent className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography
                variant="h5"
                className="font-semibold text-gray-800"
              >
                Temperature
              </Typography>
            </Box>
            <div style={{ height: 400, width: "100%" }}>
              {chartData && chartData.length > 0 ? (
                <Line data={tempData} options={options} />
              ) : (
                <Typography variant="body1" className="text-gray-500">
                  No data available to display the chart.
                </Typography>
              )}
            </div>
          </CardContent>
        </StyledCard>
        <StyledCard sx={{ marginTop: 2 }}>
          <CardContent className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography
                variant="h5"
                className="font-semibold text-gray-800"
              >
                Vibration X
              </Typography>
            </Box>
            <div style={{ height: 400, width: "100%" }}>
              {chartData && chartData.length > 0 ? (
                <Line data={vibrationXData} options={options} />
              ) : (
                <Typography variant="body1" className="text-gray-500">
                  No data available to display the chart.
                </Typography>
              )}
            </div>
          </CardContent>
        </StyledCard>
        <StyledCard sx={{ marginTop: 2 }}>
          <CardContent className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography
                variant="h5"
                className="font-semibold text-gray-800"
              >
                Vibration Y
              </Typography>
            </Box>
            <div style={{ height: 400, width: "100%" }}>
              {chartData && chartData.length > 0 ? (
                <Line data={vibrationYData} options={options} />
              ) : (
                <Typography variant="body1" className="text-gray-500">
                  No data available to display the chart.
                </Typography>
              )}
            </div>
          </CardContent>
        </StyledCard>
        <StyledCard sx={{ marginTop: 2 }}>
          <CardContent className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography
                variant="h5"
                className="font-semibold text-gray-800"
              >
                Vibration Z
              </Typography>
            </Box>
            <div style={{ height: 400, width: "100%" }}>
              {chartData && chartData.length > 0 ? (
                <Line data={vibrationZData} options={options} />
              ) : (
                <Typography variant="body1" className="text-gray-500">
                  No data available to display the chart.
                </Typography>
              )}
            </div>
          </CardContent>
        </StyledCard>
        <div className="flex justify-end space-x-4 pt-8">
          <Button
            variant="contained"
            className="w-32 md:w-40"
            sx={{
              backgroundColor: "#22c55e",
              "&:hover": {
                backgroundColor: "#16a34a",
              },
            }}
            onClick={() => handleAddSensorData("good")}
          >
            Add Good Data
          </Button>
          <Button
            variant="contained"
            className="w-32 md:w-40"
            sx={{
              backgroundColor: "#facc15",
              "&:hover": {
                backgroundColor: "#eab308",
              },
            }}
            onClick={() => handleAddSensorData("warning")}
          >
            Add Warning Data
          </Button>
          <Button
            variant="contained"
            className="w-32 md:w-40"
            sx={{
              backgroundColor: "#ef4444",
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
            onClick={() => handleAddSensorData("critical")}
          >
            Add Critical Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SensorForm;