import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Layout
 * @author Peter Rutschmann
 */
const Layout = ({loginValues}) => {
    const { isAuthenticated, userEmail, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/user/login');
    };
    return (
        <>
            <nav>
                <h1>The secret tresor application</h1>
                <p>
                    {isAuthenticated 
                        ? <>
                            <span>Logged in as: <strong>{userEmail}</strong></span>
                            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
                          </>
                        : 'Not logged in'}
                </p>
                <ul>
                    <li><a href="/">Secrets</a>
                    <ul>
                        <li><Link to="/secret/secrets">my secrets</Link></li>
                        <li><Link to="/secret/newcredential">new credential</Link></li>
                        <li><Link to="/secret/newcreditcard">new credit-card</Link></li>
                        <li><Link to="/secret/newnote">new note</Link></li>
                    </ul>
                    </li>
                    <li><a href="/">User</a>
                    <ul>
                        {!isAuthenticated ? (
                            <>
                                <li><Link to="/user/login">login</Link></li>
                                <li><Link to="/user/register">register</Link></li>
                            </>
                        ) : (
                            <li><button onClick={handleLogout}>logout</button></li>
                        )}
                    </ul>
                    </li>
                    <li><a href="/">Admin</a>
                        <ul>
                            <li><Link to="/user/users">All users</Link></li>
                            <li>Add user</li>
                            <li><Link to="/user/users/:id">Edit user</Link></li>
                            <li>All secrets</li>
                        </ul>
                    </li>
                    <li>
                        <Link to="/">About</Link>
                    </li>
                </ul>
            </nav>
            <hr/>
            <Outlet/>
        </>
    )
};

export default Layout;