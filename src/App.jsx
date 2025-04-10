import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileUploadForm from "./page/uploadpage/upload_view";
import AnimatedGridLogin from "./page/login/login_view";
import EmployeeForm from "./page/user/employeeForm_view";
import EmployeeDashboard from "./page/user/employreeDashbord";
import MachineDashboard from "./page/machine/machineDashbord";
import MachineForm from "./page/machine/machineFrom_view";
import SensorForm from "./page/machine/sensorFrommachine";
import EventForm from "./page/event/EventForm";
import EventList from "./page/event/EventList";
import AddRepairForm from "./page/event/AddRepair";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AnimatedGridLogin />} />
        {/* <Route path="/" element={<FileUploadForm />} /> */}

        {/* Employee Routes */}
        <Route path="/employee/create" element={<EmployeeForm />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/edit/:id" element={<EmployeeForm />} />
        <Route path="/employee/view/:id" element={<EmployeeForm />} />

        {/* Machine Routes */}
        <Route path="/machine/create" element={<MachineForm />} />
        <Route path="/machine/dashboard" element={<MachineDashboard />} />
        <Route path="/machine/edit/:id" element={<MachineForm />} />
        <Route path="/machine/view/:id" element={<MachineForm />} />
        <Route path="/machine/sensor/create/:id" element={<SensorForm />} />
        <Route path="/machine/sensor/view/:machine_id/:id" element={<SensorForm />} />
        <Route path="/machine/sensor/edit/:machine_id/:id" element={<SensorForm />} />
        <Route path="/machine/event/create/:id_machine" element={<EventForm />} />
        <Route path="/machine/event/list/:id_machine" element={<EventList />} />
        <Route path="/machine/event/AddRepair/:id_event" element={<AddRepairForm />} />
      </Routes>
    </Router>
  );
}

export default App;