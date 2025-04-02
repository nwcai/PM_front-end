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
  AddEvent,
  UpdateSensorState,

} from "../../service/machine/machine_service";
import { DataGrid } from "@mui/x-data-grid";

import { TbPhotoSensor3 } from "react-icons/tb";
import { DeleteSensor, GetAllSensorByIdMachine, KorawitGetAllSensorByIdMachine } from "../../service/sensor/sensor_service";
import RULChart from "../../component/RULChart" // Adjust the path if necessary
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
//**********************************************GRAPH CALCURATE**************************************************



//************************************************************************************************

const MachineForm = () => {
  const navigate = useNavigate();
  const path = useLocation();
  const { id } = useParams();
  console.log("Machine ID from useParams in MachineForm:", id); // Debugging log
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


  const columns = [
    {
      field: "id_sensor",
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
      field: "state",
      headerName: "สภาพ",
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
        AlertSuccess("Machine updated successfully!");
        navigate("/machine/dashboard");
    } catch (error) {
        console.error("Error updating machine:", error);
        if (error.message === "Network Error") {
            AlertError("Unable to connect to the server. Please check your network connection.");
        } else {
            AlertError("Failed to update machine!");
        }
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
        console.log("Response from GetMachinesById:", res);

        if (!res || !res.id_machine) {
            console.error("Invalid machine response", res);
            return;
        }

        // ตั้งค่า machineInfo ด้วย id และ id_machine
        setMachineInfo({
            ...res,
            id: id, // ใช้ id จาก useParams
        });

        // ดึงข้อมูลเซ็นเซอร์โดยใช้ id_machine
        await handleGetSensorData(res.id_machine);
    } catch (error) {
        console.error("Error getting machine:", error);
        AlertError();
    }
};
  // ********************************************RUL****************************************************
 

  
  // ********************************************EVENT****************************************************
  const handleAddEvent = () => {
    console.log("machineInfo.id_machine:", machineInfo.id_machine);
    if (!machineInfo.id_machine) {
      console.error("Machine ID is missing!");
      return;
    }
    navigate(`/machine/event/create/${machineInfo.id_machine}`);
  };

  const handleEventList = () => {
    console.log("machineInfo.id_machine:", machineInfo.id_machine);
    if (!machineInfo.id_machine) {
      console.error("Machine ID is missing!");
      return;
    }
    navigate(`/machine/event/list/${machineInfo.id_machine}`);
  };

  // ********************************************GRAPH SETTING****************************************************
  

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
                    รหัสเครื่องจักร
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
                    ชื่อเครื่องจักร
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
        {/* *****************************************GRAPH UI******************************************************* */}
        {!createState && (
          <StyledCard sx={{ marginTop: 2 }}>
          <CardContent>
            <Typography variant="h5" className="font-semibold text-gray-800">
            RUL Prediction Chart
            </Typography>
            {!createState && machineInfo.id_machine && (
              <>
                {console.log("Passing id and id_machine to RULChart:", machineInfo.id, machineInfo.id_machine)}
                <RULChart id={machineInfo.id} machineId={machineInfo.id_machine} />
              </>
            )}
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
                  onClick={handleEventList}

                >
                  Event
                </Button>
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
                  onClick={handleAddEvent}
                >
                  เพิ่ม Event
                </Button>
              </div>
            </CardContent>
          </StyledCard>



        )}


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
