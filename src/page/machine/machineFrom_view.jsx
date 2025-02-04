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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Sidebar from "../../component/sidebar";

import { AlertError, AlertSuccess } from "../../component/alert";
import { CreateMachine } from "../../service/machine/machine_service";

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

  });

  useEffect(() => {
    if (location.pathname.includes("edit")) {
      setEditState(true);
      setCreateState(false);
      handleGetMachineById()
    } else if (location.pathname.includes("view")) {
      setEditState(false);
      setCreateState(false);
      handleGetMachineById()
    } else if (location.pathname.includes("create")) {
      setEditState(true);
      setCreateState(true);
    }
  }, []);

  const handleGetMachineById = async () => {
    try {
      const res = await GetMachineById(id);
      setMachineInfo(res[0]);
    } catch (error) {
      console.error("Error getting machine by ID:", error);
    }
  }

  const handleMachineInfoChange = (field) => (event) => {
    setMachineInfo((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (createState) {
      let data = machineInfo
      data.status = 1
console.log("handle submit",data)
         await handleCreateMachine(data);
    } else {
      //   await handleUpdateMachine();
    }
  };

  const handleCreateMachine = async (data) => {
    try {
      const res = await CreateMachine(data);
      AlertSuccess();
      //navigate("/machine/dashboard");
    } catch (error) {
      console.error("Error creating machine:", error);
      AlertError();
    }
  };

  const handleUpdateMachine = async () => {
    try {
      const data = { ...machineInfo, id };
      await UpdateMachine(data);
      AlertSuccess();
      navigate("/machine/dashboard");
    } catch (error) {
      console.error("Error updating machine:", error);
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    รหัสเครื่องจักร*
                  </Typography>
                  <StyledTextField
                    required
                    value={machineInfo.machine_id}
                    onChange={handleMachineInfoChange("machine_id")}
                    placeholder="กรุณากรอกรหัสเครื่องจักร"
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  />
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    ชื่อเครื่องจักร*
                  </Typography>
                  <StyledTextField
                    required
                    value={machineInfo.name}
                    onChange={handleMachineInfoChange("name")}
                    placeholder="กรุณากรอกชื่อเครื่องจักร"
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
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
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

export default MachineForm;
