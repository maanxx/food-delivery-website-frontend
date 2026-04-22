import React, { useState, useEffect } from "react";
import { Box, Fab, Zoom, Tooltip } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBox from "./ChatBox";
import styles from "./FloatingWidget.module.css";

const FloatingWidget = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [showScroll, setShowScroll] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const checkScrollTop = () => {
        if (window.scrollY > 300) {
            setShowScroll(true);
        } else {
            setShowScroll(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", checkScrollTop);
        return () => window.removeEventListener("scroll", checkScrollTop);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <Box
            className={styles.floatingContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Zoom in={isHovered && showScroll}>
                <Tooltip title="Quay lại đầu trang" placement="left">
                    <Fab
                        className={styles.fabScroll}
                        size="medium"
                        onClick={scrollToTop}
                        aria-label="scroll back to top"
                    >
                        <KeyboardArrowUpIcon />
                    </Fab>
                </Tooltip>
            </Zoom>

            <Tooltip title="Hộp thư" placement="left">
                <Fab
                    aria-label="chat"
                    onClick={() => setIsChatOpen((prev) => !prev)}
                    className={styles.fabChat}
                >
                    <ChatIcon />
                </Fab>
            </Tooltip>

            {isChatOpen && <ChatBox onClose={() => setIsChatOpen(false)} />}
        </Box>
    );
};

export default FloatingWidget;
