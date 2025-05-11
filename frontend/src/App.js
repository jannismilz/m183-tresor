import React, {useState} from 'react';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import './css/mvp.css';
import Home from './pages/Home';
import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";
import Users from './pages/user/Users';
import LoginUser from "./pages/user/LoginUser";
import RegisterUser from "./pages/user/RegisterUser";
import Secrets from "./pages/secret/Secrets";
import NewCredential from "./pages/secret/NewCredential";
import NewCreditCard from "./pages/secret/NewCreditCard";
import NewNote from "./pages/secret/NewNote";

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
                    <Route path="/user/users" element={<Users loginValues={loginValues}/>}/>
                    <Route path="/user/login" element={<LoginUser loginValues={loginValues} setLoginValues={setLoginValues}/>}/>
                    <Route path="/user/register" element={<RegisterUser loginValues={loginValues} setLoginValues={setLoginValues}/>}/>
                    <Route path="/secret/secrets" element={<ProtectedRoute><Secrets /></ProtectedRoute>}/>
                    <Route path="/secret/newcredential" element={<ProtectedRoute><NewCredential /></ProtectedRoute>}/>
                    <Route path="/secret/newcreditcard" element={<ProtectedRoute><NewCreditCard /></ProtectedRoute>}/>
                    <Route path="/secret/newnote" element={<ProtectedRoute><NewNote /></ProtectedRoute>}/>
                    <Route path="*" element={<NoPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
        </AuthProvider>
    )
}

export default App;