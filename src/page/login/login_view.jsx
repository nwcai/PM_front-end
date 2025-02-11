import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const AnimatedGridLogin = () => {
    const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [points, setPoints] = useState([]);
  
  // Initialize grid points
  useEffect(() => {
    const initialPoints = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2
    }));
    setPoints(initialPoints);
    
    const interval = setInterval(() => {
      setPoints(prevPoints =>
        prevPoints.map(point => ({
          x: ((point.x + point.dx + 100) % 100),
          y: ((point.y + point.dy + 100) % 100),
          dx: point.dx,
          dy: point.dy
        }))
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

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
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
      
      {/* Login Form */}
      <div className="relative z-10 bg-white/10 p-8 rounded-xl backdrop-blur-md shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">เข้าสู่ระบบ</h2>
        
        <form className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">ชี่อผู้ใช้</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              placeholder="username"
            />
          </div>
          
          <div className="relative">
            <label className="block text-white text-sm font-medium mb-2">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-white">
              <input type="checkbox" className="mr-2" />
              จดจำฉัน
            </label>
            <a href="#" className="text-blue-400 hover:text-blue-300">ลืมรหัสผ่าน?</a>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            onClick={(e)=>navigate('/')}
          >
            เข้าสู่ระบบ
          </button>
        </form>
        
        {/* <p className="mt-6 text-center text-white">
          ยังไม่มีบัญชี?{' '}
          <a href="#" className="text-blue-400 hover:text-blue-300">สมัครสมาชิก</a>
        </p> */}
      </div>
    </div>
  );
};

export default AnimatedGridLogin;