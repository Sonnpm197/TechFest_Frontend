import React, {useEffect, useState} from "react";
import {getLoginUser} from "../services/UserService";
import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
import Jumbotron from "./Jumbotron";
import TextImageAnimation from "./TextImageAnimation";
import EmailCompanyList from "./EmailCompanyList";

export default function Dashboard() {
    const [emails, setEmails] = useState([]);
    const [maxEmails, setMaxEmails] = useState(10);

    const [userName, setUserName] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const name = await getLoginUser();
            setUserName(name);
        };

        fetchUser();
    }, []);

    const importEmails = async () => {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/emails/import`, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({maxEmails}),
        });
        const data = await res.json();
        setEmails(data.emails || []);
    };

    const updateStatus = async (id) => {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/emails/status`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id}),
        });
        const data = await res.json();
        setEmails(emails =>
            emails.map(email =>
                email.id === id ? {...email, status: data.status} : email
            )
        );
    };

    const editEmail = (id) => {
        // Open modal or inline edit (not implemented here)
        alert("Edit feature coming soon!");
    };

    if (!userName) return <div className="p-8">Loading or not logged in...</div>;

    return (
        <div className="relative min-h-screen bg-white text-black overflow-x-hidden">
            <Navigation/>
            <div className="pt-32">
                <EmailCompanyList/>
            </div>
        </div>
    );
}