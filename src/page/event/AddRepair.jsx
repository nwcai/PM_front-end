import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Box,
  FormControl,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Sidebar from "../../component/sidebar";
import { AlertError, AlertSuccess } from "../../component/alert";
import { AddRepair } from "../../service/machine/machine_service";

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

const AddRepairForm = () => {
  const navigate = useNavigate();
  const { id_event } = useParams(); // Correct parameter name
  const [RepairData, setRepairData] = useState({
    id: "",
    repair_date: "",
    repair_effectiveness: "",
    repair_detail: "",
  });
  
  useEffect(() => {
    if (id_event) {
      setRepairData((prev) => ({
        ...prev,
        id: id_event,
      }));
    } else {
      console.error("No ID provided in the URL");
      AlertError("Invalid repair ID!");
      navigate(-1); // Redirect back
    }
  }, [id_event, navigate]);

  const handleRepairInfoChange = (field) => (event) => {
    let value = event.target.value;

    if (field === "repair_effectiveness") {
        // ตรวจสอบให้ค่าที่ป้อนอยู่ในช่วง 0-100
        if (value < 0 || value > 100) {
            AlertError("ประสิทธิภาพการซ่อมต้องอยู่ระหว่าง 0-100%");
            return;
        }
        // แปลงค่าเป็นช่วง 0-1
        value = value / 100;
    }

    setRepairData((prev) => ({
        ...prev,
        [field]: value,
    }));
};

const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่า repair_effectiveness อยู่ในช่วง 0-1
    if (RepairData.repair_effectiveness < 0 || RepairData.repair_effectiveness > 1) {
        AlertError("ประสิทธิภาพการซ่อมต้องอยู่ระหว่าง 0-100%");
        return;
    }

    try {
        console.log("RepairData before submission:", RepairData);
        const res = await AddRepair(RepairData); // ส่งข้อมูลไปยัง API
        AlertSuccess("Repair added successfully!");
        navigate(-1); // Redirect back
    } catch (error) {
        console.error("Error adding repair:", error);
        AlertError("Failed to add repair!");
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
                เพิ่มข้อมูลการซ่อม
              </Typography>
            </Box>
            <Divider className="mb-8" />
            <form onSubmit={handleSubmit} className="space-y-8 mt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    วันที่ซ่อม
                  </Typography>
                  <StyledTextField
                    required
                    type="datetime-local"
                    value={RepairData.repair_date}
                    onChange={handleRepairInfoChange("repair_date")}
                    size="small"
                    className="bg-white"
                  />
                </FormControl>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    รายละเอียดการซ่อม
                  </Typography>
                  <StyledTextField
                    required
                    value={RepairData.repair_detail} // Correct field name
                    onChange={handleRepairInfoChange("repair_detail")} // Correct field name
                    placeholder="กรุณากรอกรายละเอียดการซ่อม"
                    size="small"
                    className="bg-white"
                    multiline
                    rows={3}
                  />
                </FormControl>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" className="text-gray-700 mb-2">
                    ประสิทธิภาพการซ่อม
                  </Typography>
                  <StyledTextField
                    required
                    type="number"
                    value={RepairData.repair_effectiveness * 100} // แสดงค่าเป็นเปอร์เซ็นต์
                    onChange={handleRepairInfoChange("repair_effectiveness")}
                    placeholder="กรุณากรอกประสิทธิภาพการซ่อม (0-100%)"
                    size="small"
                    className="bg-white"
                    inputProps={{ min: 0, max: 100 }} // จำกัดค่าให้อยู่ในช่วง 0-100
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
                  onClick={() => navigate(-1)}
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

export default AddRepairForm;