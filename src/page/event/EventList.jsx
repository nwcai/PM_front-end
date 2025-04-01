import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Divider,
    Box,
    FormControl,
    Stack,
  IconButton,
} from "@mui/material";
import Sidebar from "../../component/sidebar";
import { styled } from "@mui/material/styles";
import { FaEye } from "react-icons/fa";
import { GiAutoRepair } from "react-icons/gi";
import { TextField } from "@mui/material";
import { GetEventsByMachineId } from "../../service/machine/machine_service";
import {
  Search,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

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


const EventList = () => {
    const navigate = useNavigate();
    const { id_machine } = useParams();
    const [events, setEvents] = useState([]);
    const [eventInfo, seteventInfo] = useState({
        machine_id: "",
        name: "",
        detail: "",
        note: "",
        life_time: "",
      });
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await GetEventsByMachineId(id_machine);
                console.log("Fetched Events:", data); // ตรวจสอบข้อมูลที่ได้รับ
                setEvents(
                    data.map((event, index) => ({
                        ...event,
                        id: event.id || index, // เพิ่ม id ให้กับแต่ละแถว
                        formattedTimestamp: new Date(event.timestamp).toLocaleString("en-GB", {
                            timeZone: "Asia/Bangkok",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        }),
                    }))
                );
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };
    
        fetchEvents();
    }, [id_machine]);
    
    const columns = [
        
        { field: "id_sensor", headerName: "Sensor ID", width: 150 },
        { field: "event_name", headerName: "Event Name", width: 150 },
        { field: "event_type", headerName: "Event Type", width: 150 },
        { field: "severity", headerName: "Severity", width: 150 },
        { field: "description", headerName: "Description", width: 300 },
        { field: "formattedTimestamp", headerName: "Date", width: 200 },
        {
          field: "actions",
          headerName: "Actions",
          flex: 1,
          sortable: false,
          headerAlign: "center",
          align: "center",
          renderCell: (params) => {
            const navigate = useNavigate(); // กำหนด navigate
            const handleAddRepairClick = () => {
              navigate(`/machine/event/AddRepair/${params.row.id}`); // เปลี่ยนเป็นเส้นทางที่ต้องการเมื่อคลิกดู
            };
    
            // const handleViewClick = () => {
            //   navigate(
            //     `/machine/sensor/view/${params.row.id_machine}/${params.row.id}`
            //   ); // เปลี่ยนเป็นเส้นทางที่ต้องการเมื่อคลิกดู
            // };
    
            // const handleEditClick = () => {
            //   navigate(
            //     `/machine/sensor/edit/${params.row.id_machine}/${params.row.id}`
            //   ); // เปลี่ยนเป็นเส้นทางที่ต้องการเมื่อคลิกแก้ไข
            // };
    
            // const handleDeleteClick = async () => {
            //   // ลบข้อมูล (คุณสามารถใส่ฟังก์ชันลบที่ต้องการได้)
            //   console.log(`Delete item with id: ${params.row.id}`);
            //   await handleDeleteSensor(params.row.id)
            //   await handleGetSensorData(params.row.id_machine)
            // };
    
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
                  onClick={handleAddRepairClick}
                >
                  <GiAutoRepair />
                </IconButton>
                {/* <IconButton
                  size="small"
                  color="primary"
                  className="hover:bg-blue-50"
                  onClick={handleViewClick}
                >
                  <FaEye />
                </IconButton> */}
                {/* <IconButton
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
                </IconButton> */}
              </Stack>
            );
          },
        },
    ];


    return (

        <div className="flex w-full min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-4 md:p-8">
                <StyledCard sx={{ marginTop: 2 }}>
                    <CardContent className="p-6">
                        <Box className="flex justify-between items-center mb-6">
                            <Typography
                                variant="h5"
                                className="font-semibold text-gray-800"
                            >
                                ข้อมูลเหตุการณ์ของเครื่องจักร
                            </Typography>
                        </Box>
                        <div style={{ height: 900, width: "100%" }}>
                            <DataGrid
                                rows={events}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10, 20]}
                                disableSelectionOnClick
                            />
                        </div>
                    </CardContent>
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
                    </div>

                </StyledCard>
            </div>
        </div>

    );
};

export default EventList;