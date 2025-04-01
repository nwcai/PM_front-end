import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Box,
  FormControl,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { AddEvent } from "../../service/machine/machine_service";
import { AlertSuccess, AlertError } from "../../component/alert";
import Sidebar from "../../component/sidebar";
import { styled } from "@mui/material/styles";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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

const EventForm = () => {
  const navigate = useNavigate();
  const { id_machine } = useParams();
  const [eventData, setEventData] = useState({
    id_machine: id_machine,
    id_sensor: "None",
    event_name: "",
    event_type: "manual",
    severity: "",
    description: "",
    timestamp: dayjs(),
  });

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    if (field === "severity" && (isNaN(value) || value < 1 || value > 10)) {
        AlertError("ระดับความรุนแรงต้องเป็นตัวเลขระหว่าง 1 ถึง 10");
        return;
    }

    setEventData((prev) => ({
        ...prev,
        [field]: value,
    }));
};

  const handleDateChange = (newValue) => {
    setEventData((prev) => ({
      ...prev,
      timestamp: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNaN(eventData.severity) || eventData.severity < 1 || eventData.severity > 10) {
        AlertError("ระดับความรุนแรงต้องเป็นตัวเลขระหว่าง 1 ถึง 10");
        return;
    }

    try {
      const formattedEventData = {
        ...eventData,
        timestamp: eventData.timestamp.toISOString(),
        
      };
      console.log("Event Data:", formattedEventData);
      await AddEvent(formattedEventData);
      AlertSuccess("Event added successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error adding event:", error);
      AlertError("Failed to add event");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex w-full min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8">
          <StyledCard elevation={3} className="w-full">
            <CardContent className="p-6">
              <Box className="flex justify-between items-center mb-6">
                <Typography variant="h5" className="font-semibold text-gray-800">
                  เพิ่ม Event
                </Typography>
              </Box>
  
              <Divider className="mb-8" />
  
              <form onSubmit={handleSubmit} className="space-y-8 mt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormControl fullWidth>
                    <Typography variant="subtitle2" className="text-gray-700 mb-2">
                      ชื่อเหตุการณ์
                    </Typography>
                    <StyledTextField
                      required
                      value={eventData.event_name}
                      onChange={handleChange("event_name")}
                      placeholder="ชื่อเหตุการณ์"
                      size="small"
                      className="bg-white"
                    />
                  </FormControl>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormControl fullWidth>
                    <Typography variant="subtitle2" className="text-gray-700 mb-2">
                      ระดับความรุนแรง
                    </Typography>
                    <StyledTextField
                      required
                      value={eventData.severity}
                      onChange={handleChange("severity")}
                      placeholder="ระดับความรุนแรง (1-10)"
                      size="small"
                      className="bg-white"
                      inputProps={{ min: 1, max: 10, type: "number" }} // จำกัดค่าให้อยู่ในช่วง 0-10
                    />
                  </FormControl>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormControl fullWidth>
                    <Typography variant="subtitle2" className="text-gray-700 mb-2">
                      รายละเอียดของเหตุการณ์
                    </Typography>
                    <StyledTextField
                      required
                      value={eventData.description}
                      onChange={handleChange("description")}
                      placeholder="รายละเอียดของเหตุการณ์"
                      size="small"
                      className="bg-white"
                    />
                  </FormControl>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormControl fullWidth>
                    <Typography variant="subtitle2" className="text-gray-700 mb-2">
                      วันที่และเวลาของเหตุการณ์
                    </Typography>
                    <DateTimePicker
                      value={eventData.timestamp}
                      onChange={handleDateChange}
                      renderInput={(params) => (
                        <StyledTextField {...params} size="small" className="bg-white" />
                      )}
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
    </LocalizationProvider>
  );
};

export default EventForm;