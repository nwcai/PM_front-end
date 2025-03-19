import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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

export default MachineDashboard;
