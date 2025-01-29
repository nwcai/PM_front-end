import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileUploadForm from "./page/uploadpage/upload_view";
import AnimatedGridLogin from "./page/login/login_view";
import EmployeeForm from "./page/user/employeeForm_view";
import EmployeeDashboard from "./page/user/employreeDashbord"
function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<AnimatedGridLogin />}/>
          {/* Root path */}
          <Route path="/" element={<FileUploadForm />} />

          {/* Employee Sub-paths */}
          <Route path="/employee">
            <Route path="create" element={<EmployeeForm />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/edit/:id" element={<EmployeeForm />} />
            <Route path="/employee/view/:id" element={<EmployeeForm />} />
          </Route>

          {/* Add more nested or top-level routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
