import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams} from "react-router-dom";
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

import { AlertError, AlertSuccess } from "../../component/alert";
import {
  CreateMachine,
  GetAllNameMechines,
  GetMachinesById,
  UpdateMachine,
} from "../../service/machine/machine_service";

import { TbPhotoSensor3 } from "react-icons/tb";
import { CreateSensor, GetAllSensorById, UpdateSensor } from "../../service/sensor/sensor_service";

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
  const { id , machine_id } = useParams();
  const [editState, setEditState] = useState(true);
  const [createState, setCreateState] = useState(true);
  const [sensorInfo, setsensorInfo] = useState({
    serial_number: "",
    name: "",
    detail: "",
    note: "",
  });

  useEffect(() => {
    const fetchSensorData = async () => {
      handleGetMechineName()
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
  }, [location.pathname]); // ✅ Added dependency

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
      data.id_machine = id
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
      console.log("data",res)
      
    } catch (error) {
      console.error("handleGetMechineName", error);
    }
  }; 

  const handleCreateSensor = async () => {
    try {
      const res = await CreateSensor(sensorInfo);;
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
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
                    Serial Number*
                  </Typography>
                  <StyledTextField
                    required
                    value={sensorInfo.serial_number}
                    onChange={handlesensorInfoChange("serial_number")}
                    placeholder="กรุณากรอกรหัสเซ็นเซอร์"
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

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
                    เครื่องจัก
                  </Typography>
                  <StyledTextField
                    select
                    required
                    value={sensorInfo.name}
                    onChange={handlesensorInfoChange("name")}
                    placeholder="กรุณาเลือกชื่อเซ็นเซอร์"
                    size="small"
                    className="bg-white"
                    disabled={!editState}
                  >
                    {options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </FormControl>
              </div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
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
                  <Typography
                    variant="subtitle2"
                    className="text-gray-700 mb-2"
                  >
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
      </div>
    </div>
  );
};

export default SensorForm;
