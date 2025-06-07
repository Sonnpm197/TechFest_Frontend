import React, {useEffect, useState} from "react";
import {getLoginUser} from "../services/UserService";
import Navigation from "./Navigation";
import EmailCompanyList from "./EmailCompanyList";

export default function Dashboard() {
    const [userName, setUserName] = useState(null);

    // run only once on mount
    useEffect(() => {
        const fetchUser = async () => {
            const name = await getLoginUser();
            setUserName(name);
        };

        fetchUser();
    }, []);

    if (!userName) return <div className="p-8">Loading or not logged in...</div>;

    // overflow-x-hidden: Prevents horizontal scrolling by hiding content that overflows horizontally
    // if the parent has position: relative, the absolutely positioned child will be limited (positioned) relative to that parent.
    // min-h-screen: min height to 100% of the viewport height (like min-height: 100vh)
    // height: 100vh relative to browser height, Take up 100% of the viewport (screen) height.
    // height: 100%: take up 100% of parent height but if parent height not set then 0px
    // What is em? Relative to the font size of the current element.
    // rem = Relative to the font size of the root element (<html>).
    return (
        <div className="relative min-h-screen bg-white text-black overflow-x-hidden">
            <Navigation/>
            {/*32 = 8rem = 128px*/}
            <div className="pt-32">
                <EmailCompanyList/>
            </div>
        </div>
    );
}