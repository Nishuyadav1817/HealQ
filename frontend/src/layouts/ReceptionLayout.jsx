import React from "react";
import { Outlet } from 'react-router-dom';

const ReceptionLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default ReceptionLayout;
