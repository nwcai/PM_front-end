import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams, data } from "react-router-dom";
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
import { CreateMachine, GetMachinesById, UpdateMachine } from "../../service/machine/machine_service";

import { TbPhotoSensor3 } from "react-icons/tb";

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
  const path = useLocation();
  const { id } = useParams();
  const [editState, setEditState] = useState(true);
  const [createState, setCreateState] = useState(true);
  const [sensorInfo, setsensorInfo] = useState({
    id_sensor: "",
    name: "",
    serial_number: "",
    detail: "",
    note: "",

  });

  useEffect(() => {
    if (location.pathname.includes("edit")) {
      setEditState(true);
      setCreateState(false);
      
    } else if (location.pathname.includes("view")) {
      setEditState(false);
      setCreateState(false);
     
    } else if (location.pathname.includes("create")) {
      setEditState(true);
      setCreateState(true);
    }
  }, []);

  

  const handlesensorInfoChange = (field) => (event) => {
    setsensorInfo((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (createState) {
      let data = sensorInfo
      data.status = 1
      console.log("handle submit", data)
      
    } else {
      
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
                ข้อมูลเซ็นเซอร์
              </Typography>
            </Box>

            <Divider className="mb-8" />

            <form onSubmit={handleSubmit} className="space-y-8 mt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    รหัสเซ็นเซอร์*
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
                  Serial Number
                  </Typography>
                  <StyledTextField
                    required
                    value={sensorInfo.serial_number}
                    onChange={handlesensorInfoChange("serial_number")}
                    placeholder="กรุณากรอก Serial Number"
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
              

                {
                  editState && (
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
                  )
                }
              </div>
            </form>
          </CardContent>
        </StyledCard>
      </div>
    </div>
  );
};

export default SensorForm;
