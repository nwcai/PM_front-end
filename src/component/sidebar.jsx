import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  LogOut
} from 'lucide-react';

import { LiaIndustrySolid } from "react-icons/lia";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    //{ title: 'หน้าหลัก', icon: <Home className="w-5 h-5" /> , path : '/' },
    { title: 'ผู้ใช้งาน', icon: <Users className="w-5 h-5" /> , path : '/employee/dashboard' },
    { title: 'เครื่องจักร', icon: <LiaIndustrySolid className="w-5 h-5" /> , path : '/machine/dashboard' },
  ];

  return (
    <div className={`
      flex flex-col
      ${isExpanded ? 'w-64' : 'w-20'}
      min-h-screen
      bg-gray-800
      text-white
      transition-all duration-300
      shadow-lg
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {isExpanded && (
          <h1 className="text-xl font-bold">Predictive Maintanance</h1>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 pt-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`
              flex items-center
              w-full p-4
              hover:bg-gray-700
              transition-colors
              ${!isExpanded && 'justify-center'}
            `}
            onClick={()=>navigate(item.path)}
          >
            {item.icon}
            {isExpanded && (
              <span className="ml-4">{item.title}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700">
        <button
          className={`
            flex items-center
            w-full p-4
            hover:bg-gray-700
            transition-colors
            ${!isExpanded && 'justify-center'}
          `} onClick={()=>navigate("/login")}
        >
          <LogOut className="w-5 h-5" />
          {isExpanded && (
            <span className="ml-4">ออกจากระบบ</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;