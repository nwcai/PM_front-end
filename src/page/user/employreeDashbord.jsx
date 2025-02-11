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
  Chip,
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
import { GetAllUser } from "../../service/user/user_service";
import { FaEye } from "react-icons/fa";
import cookies from "js-cookie";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
      },
      inactive: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
      },
      onLeave: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
      },
      suspended: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
      },
      ทำงาน: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
      },
      ลาออก: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
      },
      ลางาน: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
      },
      พักงาน: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
      },
    };
    return colors[status] || colors.active;
  };

  const colors = getStatusColor(status);

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {status}
    </div>
  );
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const role = cookies.get("role_id");
  const token = cookies.get("token");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [employees, setEmployee] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if(!token){
      navigate("/login");
      return;
    }
    handleGetAllUsers();
  }, []);

  const handleGetAllUsers = async () => {
    setLoading(true);
    try {
      const res = await GetAllUser();
      setEmployee(res);
    } catch (error) {
      console.error("handleGetAllUsers", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Dialog Handlers
  const handleOpenDeleteDialog = (employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = async () => {
    try {
      await DeleteUser(selectedEmployee.id);
      handleGetAllUsers(); // Refresh the list
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("handleDeleteEmployee", error);
    }
  };

  // Edit Handler
  const handleEditEmployee = (employeeId) => {
    navigate(`/employee/edit/${employeeId}`);
  };

  const handleViewEmployee = (employeeId) => {
    navigate(`/employee/view/${employeeId}`);
  };

  const filteredEmployees = employees.filter((employee) => {
    if (!employee) return false;

    const searchFields = [
      employee.id,
      employee.first_name,
      employee.last_name,
      employee.role_name,
      employee.department_name,
      employee.tel,
      employee.email,
    ];

    const matchesSearch = searchFields.some(
      (field) =>
        field &&
        field.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesDepartment =
      !filterDepartment || employee.role_name === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate pagination
  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const departments = ["Admin", "Common"];

  const totalEmployees = employees.length;
  const employeesByDepartment = employees.reduce((acc, employee) => {
    if (employee.department_name) {
      acc[employee.department_name] = (acc[employee.department_name] || 0) + 1;
    }
    return acc;
  }, {});

  const departmentColors = {
    Admin: "#4f46e5",
    Common: "#ea580c",
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setFilterDepartment("");
    handleGetAllUsers();
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />

      <Card sx={{ width: "100%", m: 4 }}>
        <CardContent>
          {/* Dashboard Header */}
          <div className="mb-6">
            <Typography variant="h4" className="font-bold text-gray-900">
              Employee Dashboard
            </Typography>
          </div>

          {/* Summary Cards */}
          <Grid container spacing={3} className="mb-6">
            {/* Total Employees Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: "#1e40af",
                  color: "#ffffff",
                }}
                className="transition-transform duration-300 hover:scale-105"
              >
                <CardContent>
                  <Typography variant="h6" className="text-gray-200">
                    Total Employees
                  </Typography>
                  <Typography variant="h4" className="font-bold">
                    {totalEmployees}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Department Cards */}
            {Object.entries(employeesByDepartment).map(([dept, count]) => (
              <Grid item xs={12} sm={6} md={3} key={dept}>
                <Card
                  sx={{
                    backgroundColor: departmentColors[dept] || "#6b7280",
                    color: "#ffffff",
                  }}
                  className="transition-transform duration-300 hover:scale-105"
                >
                  <CardContent>
                    <Typography variant="h6" className="text-gray-200">
                      {dept}
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Controls */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <TextField
                  placeholder="Search employees..."
                  variant="outlined"
                  size="small"
                  className="flex-1 min-w-[200px]"
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

                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  size="small"
                  displayEmpty
                  className="min-w-[180px]"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  className="border-blue-600 text-blue-600 hover:border-blue-700"
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>

               { role == 1 && (
                 <Button
                 variant="contained"
                 color="primary"
                 startIcon={<AddIcon />}
                 className="bg-blue-600 hover:bg-blue-700"
                 onClick={() => navigate("/employee/create")}
               >
                 Add Employee
               </Button>
               )}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <div className="flex flex-col">
            <TableContainer component={Paper} className="shadow-md">
              <Table>
                <TableHead className="bg-gray-50">
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEmployees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      hover
                      className="transition-colors duration-200"
                    >
                      <TableCell className="font-medium">
                        {employee.user_id}
                      </TableCell>
                      <TableCell>{`${employee.first_name} ${employee.last_name}`}</TableCell>
                      <TableCell>{employee.role_name}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.tel}</div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={employee.status_name || "ทำงาน"} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          className="hover:bg-blue-50"
                          onClick={() => handleViewEmployee(employee.id)}
                        >
                          <FaEye />
                        </IconButton>
                        {role == 1 && (
                          <IconButton
                            size="small"
                            color="primary"
                            className="hover:bg-blue-50"
                            onClick={() => handleEditEmployee(employee.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {role == 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            className="hover:bg-red-50"
                            onClick={() => handleOpenDeleteDialog(employee)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredEmployees.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50]}
              className="bg-white border-t border-gray-200"
            />
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Confirm Delete"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete employee{" "}
                {selectedEmployee
                  ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                  : ""}
                ? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog} color="primary">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteEmployee}
                color="error"
                variant="contained"
                autoFocus
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

export default EmployeeDashboard;
