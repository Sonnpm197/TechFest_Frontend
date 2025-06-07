import React, { useEffect, useState } from 'react';
import { getLoginUser } from '../services/UserService';
import axios from "axios"; // adjust the path if needed
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
    const [userName, setUserName] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const name = await getLoginUser();
            setUserName(name);
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, {
                withCredentials: true,
            });
            setUserName(null);
            navigate('/'); // Redirect to home
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <nav className="flex justify-between items-center p-8 fixed w-full z-10 bg-white bg-opacity-80">
            <div className="flex items-center space-x-6">
                <div className="text-2xl font-semibold tracking-wide select-none">
                    <a href="/">
                        Interview Importer
                    </a>

                </div>
                {userName && (
                    <a
                        href="/dashboard"
                        className="text-2xl font-light  hover:underline transition-all duration-200"
                    >
                        Dashboard
                    </a>
                )}
            </div>

            {userName ? (
                <div className="flex items-center space-x-4">
                    <span className="text-xl text-gray-800">Hi, {userName}</span>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-full text-xl shadow hover:bg-red-600 transition-all duration-200"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <a
                    href={`${process.env.REACT_APP_BACKEND_URL}/auth/google`}
                    className="bg-black text-white px-8 py-3 rounded-full text-lg font-medium shadow hover:bg-gray-900 transition-all duration-200"
                    style={{letterSpacing: '0.03em'}}
                >
                    Login with Gmail
                </a>
            )}
        </nav>
    );
};

export default Navigation;
