import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Cookies from "js-cookie";
import { Login } from "../../service/user/user_service";
import { AlertError, AlertSuccess } from "../../component/alert";

const AnimatedGridLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize grid points
  useEffect(() => {
    const initialPoints = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
    }));
    setPoints(initialPoints);

    const interval = setInterval(() => {
      setPoints((prevPoints) =>
        prevPoints.map((point) => ({
          x: (point.x + point.dx + 100) % 100,
          y: (point.y + point.dy + 100) % 100,
          dx: point.dx,
          dy: point.dy,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading state during login

    const username = e.target.username.value;
    const password = e.target.password.value;

    if (!username || !password) {
      AlertError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      setLoading(false);
      return;
    }

    try {
      // Call the login function and wait for response
      const res = await Login({ username: username, password: password });
      console.log("Login response:", res); // Log the response to check structure

      if (res && res.role_id && res.token) {
        // Ensure role_id and token are strings before using them
        Cookies.set('token', res.token, { expires: 7 });
        Cookies.set('role_id', res.role_id, { expires: 7 });

        // Redirect to dashboard or another page
        navigate("/machine/dashboard"); 
      } else {
        console.error("Invalid response from server:", res);
        AlertError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("Error during login:", error);
      AlertError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false); // Reset loading state after request
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        {points.map((point, index) => (
          <div
            key={index}
            className="absolute h-2 w-2 bg-blue-500/20 rounded-full"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Login Form */}
      <div className="relative z-10 bg-white/10 p-8 rounded-xl backdrop-blur-md shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          เข้าสู่ระบบ
        </h2>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              ชี่อผู้ใช้
            </label>
            <input
              type="text"
              name="username"
              className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              placeholder="username"
            />
          </div>

          <div className="relative">
            <label className="block text-white text-sm font-medium mb-2">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-white">
              <input type="checkbox" className="mr-2" />
              จดจำฉัน
            </label>
            <a href="#" className="text-blue-400 hover:text-blue-300">
              ลืมรหัสผ่าน?
            </a>
          </div> */}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnimatedGridLogin;
