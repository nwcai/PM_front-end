import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Box,
} from "@mui/material";
import {
  Search,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Sidebar from "../../component/sidebar";

import { FaEye } from "react-icons/fa";
import {
  DeleteMachinesById,
  GetAllMachines,
  GetMachinesById,
} from "../../service/machine/machine_service";

const MachineDashboard = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  useEffect(() => {
    handleGetAllMachines();
  }, []);

  const handleGetAllMachines = async () => {
    setLoading(true);
    try {
      const res = await GetAllMachines();
      console.log(res);
      setMachines(res);
    } catch (error) {
      console.error("handleGetAllMachines", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (machine) => {
    setSelectedMachine(machine);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedMachine(null);
  };

  const handleDeleteMachine = async () => {
    try {
      await DeleteMachinesById(selectedMachine.id);
      handleGetAllMachines();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("handleDeleteMachine", error);
    }
  };

  const handleEditMachine = (machineId) => {
    navigate(`/machine/edit/${machineId}`);
  };

  const handleViewMachine = (machineId) => {
    navigate(`/machine/view/${machineId}`);
  };

  const filteredMachines = machines.filter((machine) => {
    if (!machine) return false;

    return (
      machine.machine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machine_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const paginatedMachines = filteredMachines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <Card sx={{ width: "100%", m: 4 }}>
        <CardContent>
          <Typography variant="h4" className="font-bold text-gray-900">
            Machine Dashboard
          </Typography>

          <TextField
            placeholder="Search machines..."
            variant="outlined"
            size="small"
            className="my-4 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <div className="flex justify-end mt-4">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/machine/create")}
            >
              Add Machine
            </Button>
          </div>
          <TableContainer component={Paper} className="mt-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Sensor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMachines.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell>{machine.id_machine}</TableCell>
                    <TableCell>{machine.machine_name}</TableCell>
                    <TableCell>{machine.sensor_count || 0}</TableCell>
                    <TableCell>{machine.status_name}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleViewMachine(machine.id)}>
                        <FaEye />
                      </IconButton>
                      <IconButton onClick={() => handleEditMachine(machine.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(machine)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredMachines.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
          />

          <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete machine "
                {selectedMachine?.machine_name}"?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
              <Button
                onClick={handleDeleteMachine}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

const MachineForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ดึง id จาก URL
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
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
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

      setMachineInfo(res); // ตั้งค่า machineInfo
      await handleGetSensorData(res.id_machine); // ดึงข้อมูลเซ็นเซอร์
    } catch (error) {
      console.error("Error getting machine:", error);
      AlertError();
    }
  };

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
              {/* ฟอร์มสำหรับกรอกข้อมูล */}
            </form>
          </CardContent>
        </StyledCard>

        {/* *****************************************GRAPH UI******************************************************* */}
        {!createState && machineInfo.id_machine && (
          <StyledCard sx={{ marginTop: 2 }}>
            <CardContent>
              <Typography variant="h5" className="font-semibold text-gray-800">
                กราฟ
              </Typography>

              {/* ส่ง machineInfo.id_machine ไปยัง RULChart */}
              <RULChart machineId={machineInfo.id_machine} />

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
      </div>
    </div>
  );
};

export default MachineDashboard;
export { MachineForm };
