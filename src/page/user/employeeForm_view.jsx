import React, { useState, useEffect } from "react";
import { useNavigate, useLocation , useParams } from "react-router-dom";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Sidebar from "../../component/sidebar";
import { CreateUser, GetUserById, UpdateUser } from "../../service/user/user_service";
import { AlertError, AlertSuccess } from "../../component/alert";



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

const EmployeeForm = () => {
  const navigate = useNavigate();
  const path = useLocation();
  const { id } = useParams();
  const [editState, setEditState] = useState(true);
  const [createState, setCreateState] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    role_name: "",
    tel: "",
    email: "",
  });

  useEffect(() => {
    if (location.pathname.includes("edit")) {
      setEditState(true);
      setCreateState(false);
      handleGetUserById()
    } else if (location.pathname.includes("view")) {
      setEditState(false);
      setCreateState(false);
      handleGetUserById()
    } else if (location.pathname.includes("create")) {
      setEditState(true);
      setCreateState(true);
    }
  }, []);

  const handleGetUserById = async () =>{
    try {
      const res = await GetUserById(id);
      setEmployeeInfo(res[0]);
    } catch (error) {
      console.error("Error getting user by ID:", error);
    }
  }

  const handleEmployeeInfoChange = (field) => (event) => {
    const newValue = event.target.value;

    setEmployeeInfo((prev) => {
      const updatedInfo = {
        ...prev,
        [field]: newValue,
      };

      // Dynamically update department_id based on department name
      

      if (field === "role_name") {
        const roleMapping = {
          Admin: 1,
          Common: 2,
        };

        updatedInfo["role_id"] = roleMapping[newValue] || null;
      }

      return updatedInfo;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", employeeInfo);
    // await handleCreateUser();
    if(createState){
      await handleCreateUser();
    }else{
      await handleUpdateUser();
    }
  };

  

  const handleCreateUser = async () => {
    try {
      const res = await CreateUser(employeeInfo);
      AlertSuccess();
      navigate("/employee/dashboard");
    } catch (error) {
      console.error("Error creating user:", error);
      AlertError();
    }
  };

  const handleUpdateUser = async () => {
    try {
      const data = employeeInfo
      data.id = id
      const res = await UpdateUser(data)
      AlertSuccess();
      navigate("/employee/dashboard");
    } catch (error) {
      console.error("Error creating user:", error);
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
                ข้อมูลพนักงาน
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
                    รหัสพนักงาน*
                  </Typography>
                  <StyledTextField
                    required
                    value={employeeInfo.user_id}
                    onChange={handleEmployeeInfoChange("user_id")}
                    placeholder="กรุณากรอกรหัสพนักงาน"
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
                    ชื่อจริง*
                  </Typography>
                  <StyledTextField
                    required
                    value={employeeInfo.first_name}
                    onChange={handleEmployeeInfoChange("first_name")}
                    placeholder="กรุณากรอกชื่อจริง"
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
                    นามสกุล*
                  </Typography>
                  <StyledTextField
                    required
                    value={employeeInfo.last_name}
                    onChange={handleEmployeeInfoChange("last_name")}
                    placeholder="กรุณากรอกนามสกุล"
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
                    เบอร์โทรศัพท์
                  </Typography>
                  <StyledTextField
                    type="tel"
                    value={employeeInfo.tel}
                    onChange={handleEmployeeInfoChange("tel")}
                    placeholder="กรุณากรอกเบอร์โทรศัพท์"
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
                    อีเมล
                  </Typography>
                  <StyledTextField
                    type="email"
                    value={employeeInfo.email}
                    onChange={handleEmployeeInfoChange("email")}
                    placeholder="กรุณากรอกอีเมล"
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
                    ตำแหน่ง*
                  </Typography>
                  <StyledTextField
                    select
                    required
                    disabled={!editState}
                    value={employeeInfo.role_name}
                    onChange={handleEmployeeInfoChange("role_name")}
                    size="small"
                    className="bg-white"
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (value) => {
                        if (value === "") {
                          return (
                            <span style={{ color: "gray" }}>
                              กรุณาเลือกตำแหน่ง
                            </span>
                          );
                        }
                        return value;
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      กรุณาเลือกตำแหน่ง
                    </MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Common">Common</MenuItem>
                  </StyledTextField>
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
                  onClick={(e) => navigate("/employee/dashboard")}
                >
                  กลับ
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
                >
                  บันทึก
                </Button>
              </div>
            </form>
          </CardContent>
        </StyledCard>
      </div>
    </div>
  );
};

export default EmployeeForm;
