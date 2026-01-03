import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import EmployeeForm from '../../components/common/EmployeeForm';
import DeleteModal from '../../components/common/DeleteModal';

import toast from 'react-hot-toast';

const EmployeeEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        const data = res.data.data || res.data;

        // Map the response data to match form expectations
        // The API might return department_name, position_title, role_name
        // but we need to fetch the IDs. For now, we'll need to map based on names
        // or the API should return IDs. Let's assume it returns IDs as well
        const mappedData = {
          first_name: data.first_name,
          last_name: data.last_name,
          department_id: data.department_id || '',
          position_id: data.position_id || '',
          role_id: data.role_id || '',
          status: (data.status || 'active').toLowerCase(),
          avatar_url: data.avatar_url || ''
        };

        setInitialData(mappedData);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleUpdate = async (data: any) => {
    try {
      await api.patch(`/employees/${id}`, data);
      toast.success('Employee updated successfully');
      navigate('/employees');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update employee');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deleted');
      navigate('/employees');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete employee');
    }
  };

  const handleClose = () => {
    navigate('/employees');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <EmployeeForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleUpdate}
        onDelete={() => setIsDeleteOpen(true)}
        onClose={handleClose}
        loading={loading}
      />
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Warning Model"
        message="Are you Sure to delete this Employee ?"
        subMessage="This action can't be undone"
      />
    </>
  );
};

export default EmployeeEdit;
