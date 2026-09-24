import React from "react";
import { Outlet } from 'react-router-dom';

const DoctorLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default DoctorLayout;
