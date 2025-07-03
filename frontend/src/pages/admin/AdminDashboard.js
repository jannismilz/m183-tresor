import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { userEmail, userRole } = useAuth();
    
    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h2>Admin Dashboard</h2>
                </div>
                <div className="card-body">
                    <div className="alert alert-info">
                        <p><strong>Welcome, Admin!</strong></p>
                        <p>Email: {userEmail}</p>
                        <p>Role: {userRole}</p>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="card mb-4">
                                <div className="card-header">User Management</div>
                                <div className="card-body">
                                    <p>Manage system users and their permissions.</p>
                                    <button className="btn btn-outline-primary">Manage Users</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card mb-4">
                                <div className="card-header">System Settings</div>
                                <div className="card-body">
                                    <p>Configure system-wide settings and options.</p>
                                    <button className="btn btn-outline-primary">Settings</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card mb-4">
                                <div className="card-header">Audit Logs</div>
                                <div className="card-body">
                                    <p>View system activity and security logs.</p>
                                    <button className="btn btn-outline-primary">View Logs</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
