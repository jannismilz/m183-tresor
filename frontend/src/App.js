import React, {useState} from 'react';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import './css/modern.css';
import Home from './pages/Home';
import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";
import Users from './pages/user/Users';
import LoginUser from "./pages/user/LoginUser";
import RegisterUser from "./pages/user/RegisterUser";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword";
import Secrets from "./pages/secret/Secrets";
import NewCredential from "./pages/secret/NewCredential";
import NewCreditCard from "./pages/secret/NewCreditCard";
import NewNote from "./pages/secret/NewNote";
import TwoFactorVerification from "./components/auth/TwoFactorVerification";
import OAuth2Redirect from "./components/auth/OAuth2Redirect";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/user/login" />;
    }
    
    return children;
};

// Admin protected route component
const AdminProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, userRole } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/user/login" />;
    }
    
    if (userRole !== 'admin') {
        // Redirect to home page if user is not an admin
        return <Navigate to="/" />;
    }
    
    return children;
};

/**
 * App
 * @author Peter Rutschmann
 */
function App() {
    const [loginValues, setLoginValues] = useState({
        email: "",
        password: "",
    });
    
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout loginValues={loginValues}/>}>
                    <Route index element={<Home/>}/>
                    <Route path="two-factor-verification" element={<TwoFactorVerification />} />
                    <Route path="oauth2/redirect" element={<OAuth2Redirect />} />
                    <Route path="user">
                        <Route path="users" element={<Users loginValues={loginValues}/>}/>
                        <Route path="login" element={<LoginUser loginValues={loginValues} setLoginValues={setLoginValues}/>}/>
                        <Route path="register" element={<RegisterUser loginValues={loginValues} setLoginValues={setLoginValues}/>}/>
                        <Route path="forgot-password" element={<ForgotPassword/>}/>
                        <Route path="reset-password" element={<ResetPassword/>}/>
                    </Route>
                    <Route path="/secret/secrets" element={<ProtectedRoute><Secrets /></ProtectedRoute>}/>
                    <Route path="/secret/newcredential" element={<ProtectedRoute><NewCredential /></ProtectedRoute>}/>
                    <Route path="/secret/newcreditcard" element={<ProtectedRoute><NewCreditCard /></ProtectedRoute>}/>
                    <Route path="/secret/newnote" element={<ProtectedRoute><NewNote /></ProtectedRoute>}/>
                    <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>}/>
                    <Route path="*" element={<NoPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
        </AuthProvider>
    )
}

export default App;