import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeForm from '../../components/common/EmployeeForm';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EmployeeAdd: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = async (data: any) => {
    try {
      await api.post('/employees', data);
      toast.success('Employee created successfully');
      navigate('/employees');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || 'Failed to create employee';
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleClose = () => {
    navigate('/employees');
  };

  return (
    <EmployeeForm 
      mode="add" 
      onSubmit={handleCreate}
      onClose={handleClose}
    />
  );
};

export default EmployeeAdd;
