import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate, useLocation, useParams, } from "react-router-dom";
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
  Stack,
  IconButton,
} from "@mui/material";
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import { styled } from "@mui/material/styles";
import Sidebar from "../../component/sidebar";
import {
  Search,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import { AlertError, AlertSuccess } from "../../component/alert";
import {
  CreateMachine,
  GetMachinesById,
  UpdateMachine,
} from "../../service/machine/machine_service";
import { DataGrid } from "@mui/x-data-grid";

import { TbPhotoSensor3 } from "react-icons/tb";
import { DeleteSensor, GetAllSensorByIdMachine, KorawitGetAllSensorByIdMachine } from "../../service/sensor/sensor_service";

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
//************************************************************************************************
const calculateRUL = (timeToZero, currentTime) => {
  const aInitial = 100 / (timeToZero ** 2);
  const t = Array.from({ length: 100 }, (_, i) => (i / 99) * timeToZero);
  const RULCombined = t.map(time => 100 - aInitial * (time ** 2));

  const RULCurrent = interpolate(currentTime, t, RULCombined);
  const timeToWarning = interpolate(70, RULCombined, t);
  const timeToCritical = interpolate(40, RULCombined, t);

  const hoursToWarning = Math.max(0, timeToWarning - currentTime);
  const hoursToCritical = Math.max(0, timeToCritical - currentTime);

  return { t, RULCombined, RULCurrent, hoursToWarning, hoursToCritical };
};

const interpolate = (x, xs, ys) => {
  for (let i = 1; i < xs.length; i++) {
    if (x >= ys[i] && x <= ys[i - 1]) {
      const x0 = xs[i - 1], x1 = xs[i];
      const y0 = ys[i - 1], y1 = ys[i];
      return x0 + ((x - y0) * (x1 - x0)) / (y1 - y0);
    }
  }
  return xs[xs.length - 1];
};
//************************************************************************************************

const MachineForm = () => {
  const navigate = useNavigate();
  const path = useLocation();
  const { id } = useParams();
  const [editState, setEditState] = useState(true);
  const [createState, setCreateState] = useState(true);
  const [machineInfo, setMachineInfo] = useState({
    machine_id: "",
    name: "",
    detail: "",
    note: "",
    life_time: "",
  });
  const [sensorData, setSensorData] = useState([]); // New state for sensor data
  const [rulData, setRulData] = useState([]);
  const [currentRUL, setCurrentRUL] = useState(null);
  const [hoursToWarning, setHoursToWarning] = useState(null);
  const [hoursToCritical, setHoursToCritical] = useState(null);
  const [currentPoint, setCurrentPoint] = useState({ time: 0, value: 0 });
  const [currentTime, setCurrentTime] = useState(0);


  useEffect(() => {
    KorawithandleGetSensorData();
    if (location.pathname.includes("edit")) {
      setEditState(true);
      setCreateState(false);
      handleGetMachinesById();
    } else if (location.pathname.includes("view")) {
      setEditState(false);
      setCreateState(false);
      handleGetMachinesById();
    } else if (location.pathname.includes("create")) {
      setEditState(true);
      setCreateState(true);
    }
  }, []);

  useEffect(() => {
    if (machineInfo.life_time) {
      const lifeTimeInHours = machineInfo.life_time;
      const { RULCurrent } = calculateRUL(lifeTimeInHours, currentTime);
      setCurrentPoint({ time: currentTime, value: RULCurrent });
    }
  }, [currentTime, machineInfo.life_time]);


  const columns = [
    {
      field: "serial_number",
      headerName: "SERIAL_ID",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: "ชื่อ",
      flex: 1,
      editable: true,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status_name",
      headerName: "สถานะ",
      flex: 1,
      editable: true,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const navigate = useNavigate(); // กำหนด navigate

        const handleViewClick = () => {
          navigate(
            `/machine/sensor/view/${params.row.id_machine}/${params.row.id}`
          ); // เปลี่ยนเป็นเส้นทางที่ต้องการเมื่อคลิกดู
        };

        const handleEditClick = () => {
          navigate(
            `/machine/sensor/edit/${params.row.id_machine}/${params.row.id}`
          ); // เปลี่ยนเป็นเส้นทางที่ต้องการเมื่อคลิกแก้ไข
        };

        const handleDeleteClick = async () => {
          // ลบข้อมูล (คุณสามารถใส่ฟังก์ชันลบที่ต้องการได้)
          console.log(`Delete item with id: ${params.row.id}`);
          await handleDeleteSensor(params.row.id)
          await handleGetSensorData(params.row.id_machine)
        };

        return (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center", // จัดให้อยู่ตรงกลาง
            }}
          >
            <IconButton
              size="small"
              color="primary"
              className="hover:bg-blue-50"
              onClick={handleViewClick}
            >
              <FaEye />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              className="hover:bg-blue-50"
              onClick={handleEditClick}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              className="hover:bg-red-50"
              onClick={handleDeleteClick}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  const handleView = (row) => {
    console.log("Viewing:", row);
    alert(`View: ${JSON.stringify(row)}`);
  };

  const handleEdit = (row) => {
    console.log("Editing:", row);
    alert(`Edit: ${JSON.stringify(row)}`);
  };

  const handleDelete = (row) => {
    console.log("Deleting:", row);
    alert(`Delete: ${JSON.stringify(row)}`);
  };

  const rows = [
    { id: 1, lastName: "Snow", firstName: "Jon", age: 14, machine_id: 1 },
  ];

  const handleMachineInfoChange = (field) => (event) => {
    setMachineInfo((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (createState) {
      let data = machineInfo;
      data.status = 1;
      console.log("handle submit", data);
      await handleCreateMachine(data);
    } else {
      await handleUpdateMachine(machineInfo);
    }
  };

  const handleCreateMachine = async (data) => {
    try {
      const res = await CreateMachine(data);
      AlertSuccess();
      navigate("/machine/dashboard");
    } catch (error) {
      console.error("Error creating machine:", error);
      AlertError();
    }
  };

  const handleUpdateMachine = async (data) => {
    try {
      const res = await UpdateMachine(data, id);
      AlertSuccess();
      navigate("/machine/dashboard");
    } catch (error) {
      console.error("Error creating machine:", error);
      AlertError();
    }
  };

  const handleGetSensorData = async (machineId) => {
    try {
      const response = await GetAllSensorByIdMachine(machineId);
      if (response && Array.isArray(response)) {
        // Ensure each row has a unique id field required by DataGrid
        const formattedData = response.map((sensor, index) => ({
          ...sensor,
          id: sensor.id || index + 1, // Use sensor.id if available, otherwise use index
        }));
        setSensorData(formattedData);
      } else {
        console.error("Invalid sensor data format:", response);
        setSensorData([]);
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      AlertError();
      setSensorData([]);
    }
  };

  const handleDeleteSensor = async (id) => {
    try {
      const res = await DeleteSensor(id)
    } catch (error) {
      console.error("Error deleting sensor data:", error);
      AlertError();
    }
  };

  const handleGetMachinesById = async () => {
    try {
      if (!id) {
        console.error("Invalid machine ID");
        return;
      }

      const res = await GetMachinesById(id);

      if (!res || !res.id_machine) {
        console.error("Invalid machine response", res);
        return;
      }

      setMachineInfo(res);
      await handleGetSensorData(res.id_machine);
      // Fetch RUL data here
      const lifeTimeInHours = res.life_time; // Use life_time directly as hours
      const { t, RULCombined, RULCurrent, hoursToWarning, hoursToCritical } = calculateRUL(lifeTimeInHours, currentTime);
      setRulData(t.map((time, index) => ({ time, value: RULCombined[index] })));
      setCurrentRUL(RULCurrent);
      setHoursToWarning(hoursToWarning);
      setHoursToCritical(hoursToCritical);
      setCurrentPoint({ time: currentTime, value: RULCurrent }); // Set current point here
    } catch (error) {
      console.error("Error getting machine:", error);
      AlertError();
    }
  };
// ************************************************************************************************
const rulChartData = {
  labels: rulData.map(data => data.time),
  datasets: [
    {
      label: 'Remaining Useful Life (RUL)',
      data: rulData.map(data => data.value),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      pointRadius: 0, // Remove points from the graph
    },
    {
      label: 'Warning Level (70%)',
      data: Array(rulData.length).fill(70),
      borderColor: 'rgba(255, 165, 0, 1)',
      borderDash: [10, 5],
      fill: false,
      pointRadius: 0,
    },
    {
      label: 'Critical Level (40%)',
      data: Array(rulData.length).fill(40),
      borderColor: 'rgba(255, 0, 0, 1)',
      borderDash: [10, 5],
      fill: false,
      pointRadius: 0,
    },
    {
      label: 'Current Point',
      data: [{ x: currentPoint.time, y: currentPoint.value }],
      borderColor: 'rgba(0, 0, 255, 1)',
      backgroundColor: 'rgba(0, 0, 255, 1)',
      fill: false,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
};
//************************************************************************************************

  //

  const KorawithandleGetSensorData = async () => {
    try {
      const response = await KorawitGetAllSensorByIdMachine();
      console.log(response);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      AlertError();

    }
  };



  //
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8">
        <StyledCard elevation={3} className="w-full">
          <CardContent className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="font-semibold text-gray-800">
                ข้อมูลเครื่องจักร
              </Typography>
            </Box>

            <Divider className="mb-8" />

            <form onSubmit={handleSubmit} className="space-y-8 mt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
                    รหัสเครื่องจักร*
                  </Typography>
                  <StyledTextField
                    required
                    value={machineInfo.id_machine}
                    onChange={handleMachineInfoChange("id_machine")}
                    placeholder="กรุณากรอกรหัสเครื่องจักร"
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
                    ชื่อเครื่องจักร*
                  </Typography>
                  <StyledTextField
                    required
                    value={machineInfo.machine_name}
                    onChange={handleMachineInfoChange("machine_name")}
                    placeholder="กรุณากรอกชื่อเครื่องจักร"
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
                    รายละเอียด
                  </Typography>
                  <StyledTextField
                    value={machineInfo.detail}
                    onChange={handleMachineInfoChange("detail")}
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
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
                    หมายเหตุ
                  </Typography>
                  <StyledTextField
                    value={machineInfo.note}
                    onChange={handleMachineInfoChange("note")}
                    placeholder=""
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                    multiline
                    rows={2}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
                    อายุการใช้งาน
                  </Typography>
                  <StyledTextField
                    value={machineInfo.life_time}
                    onChange={handleMachineInfoChange("life_time")}
                    placeholder="หน่วย(ชั่วโมง)"
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                    multiline
                    //rows={2}
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
                  onClick={(e) => navigate("/machine/dashboard")}
                >
                  กลับ
                </Button>

                {location.pathname.includes("edit") && (
                  <Button
                    variant="contained"
                    startIcon={<TbPhotoSensor3 />}
                    className="w-32 md:w-40"
                    sx={{
                      backgroundColor: "#EA8741",
                      "&:hover": {
                        backgroundColor: "#FD6A02",
                      },
                    }}
                    onClick={(e) => navigate("/machine/sensor/create/" + machineInfo.id_machine)}
                  >
                    เพิ่มเซนเซอร์
                  </Button>
                )}
                <div className="flex justify-end space-x-4 pt-8"></div>

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
{/* ************************************************************************************************ */}
<StyledCard sx={{ marginTop: 2 }}>
          <CardContent className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="font-semibold text-gray-800">
                กราฟ
              </Typography>
            </Box>
            <div style={{ height: 400, width: "100%" }}>
              <Line data={rulChartData} />
            </div>
            {currentRUL !== null && (
              <Typography variant="body1" className="mt-4">
                RUL ปัจจุบัน: {currentRUL.toFixed(2)}%
              </Typography>
            )}
            {hoursToWarning !== null && (
              <Typography variant="body1" className="mt-2">
                อีก {hoursToWarning.toFixed(2)} ชั่วโมง จะถึงเส้นเตือน (70%)
              </Typography>
            )}
            {hoursToCritical !== null && (
              <Typography variant="body1" className="mt-2">
                อีก {hoursToCritical.toFixed(2)} ชั่วโมง จะถึงเส้นวิกฤต (40%)
              </Typography>
            )}
          </CardContent>
        </StyledCard>
{/* ************************************************************************************************ */}
        {!createState && (
          <StyledCard sx={{ marginTop: 2 }}>
            <CardContent className="p-6">
              <Box className="flex justify-between items-center mb-6">
                <Typography
                  variant="h5"
                  className="font-semibold text-gray-800"
                >
                  ข้อมูลเซ็นเซอร์
                </Typography>
              </Box>
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={sensorData}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  disableSelectionOnClick
                />
              </div>
            </CardContent>
          </StyledCard>
        )}
      </div>
    </div>
  );

};

export default MachineForm;
