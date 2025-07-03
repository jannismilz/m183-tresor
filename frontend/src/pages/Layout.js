import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Layout
 * @author Peter Rutschmann
 */
const Layout = ({loginValues}) => {
    const { isAuthenticated, userEmail, userRole, logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = userRole === 'admin';
    
    const handleLogout = () => {
        logout();
        navigate('/user/login');
    };
    return (
        <>
            <header className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-brand">The Secret Tresor</Link>
                    
                    <div className="navbar-user">
                        {isAuthenticated ? (
                            <>
                                <span>Logged in as: <strong>{userEmail}</strong></span>
                                <button onClick={handleLogout} className="btn btn-sm">Logout</button>
                            </>
                        ) : (
                            <span className="text-gray-600">Not logged in</span>
                        )}
                    </div>
                    
                    <nav>
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link to="/" className="nav-link">Secrets</Link>
                                <ul className="dropdown-menu">
                                    <li><Link to="/secret/secrets" className="dropdown-item">My Secrets</Link></li>
                                    <li><Link to="/secret/newcredential" className="dropdown-item">New Credential</Link></li>
                                    <li><Link to="/secret/newcreditcard" className="dropdown-item">New Credit Card</Link></li>
                                    <li><Link to="/secret/newnote" className="dropdown-item">New Note</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <Link to="/" className="nav-link">User</Link>
                                <ul className="dropdown-menu">
                                    {!isAuthenticated ? (
                                        <>
                                            <li><Link to="/user/login" className="dropdown-item">Login</Link></li>
                                            <li><Link to="/user/register" className="dropdown-item">Register</Link></li>
                                        </>
                                    ) : (
                                        <li><button onClick={handleLogout} className="dropdown-item">Logout</button></li>
                                    )}
                                </ul>
                            </li>
                            {isAdmin && (
                                <li className="nav-item">
                                    <Link to="/" className="nav-link">Admin</Link>
                                    <ul className="dropdown-menu">
                                        <li><Link to="/admin/dashboard" className="dropdown-item">Dashboard</Link></li>
                                        <li><Link to="/user/users" className="dropdown-item">All Users</Link></li>
                                        <li><span className="dropdown-item">Add User</span></li>
                                        <li><Link to="/user/users/:id" className="dropdown-item">Edit User</Link></li>
                                        <li><span className="dropdown-item">All Secrets</span></li>
                                    </ul>
                                </li>
                            )}
                            <li className="nav-item">
                                <Link to="/" className="nav-link">About</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            <main>
                <Outlet/>
            </main>
        </>
    )
};

export default Layout;