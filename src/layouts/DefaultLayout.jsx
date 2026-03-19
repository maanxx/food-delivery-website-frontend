import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { Footer, Header } from "@components/index";
import useLoading from "@hooks/useLoading";
import useAuth from "@hooks/useAuth";
import { authLogin } from "@services/authService";

function DefaultLayout() {
    const { login, logout } = useAuth();
    const { setLoading } = useLoading();

    useEffect(() => {
        const authenticate = async () => {
            setLoading(true);
            try {
                if (await authLogin()) {
                    login();
                } else {
                    logout();
                }
            } catch (error) {
                console.log(error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        authenticate();
    }, []);

    return (
        <>
            <Header />
            <Outlet /> {/* chilren */}
            <Footer />
        </>
    );
}

export default DefaultLayout;
