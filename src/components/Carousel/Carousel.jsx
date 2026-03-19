import React, { useState, useLayoutEffect, useCallback, useRef, forwardRef } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import classNames from "classnames/bind";

import styles from "./Carousel.module.css";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const cx = classNames.bind(styles);

const Carousel = ({ items, active: initialActive, autoCycle = true, cycleInterval = 3000000 }) => {
    const [active, setActive] = useState(initialActive);
    const [direction, setDirection] = useState("");
    const [isTransitioning, setIsTransitioning] = useState(false);

    const itemRefs = useRef(items.map(() => React.createRef()));

    useLayoutEffect(() => {
        let cycle;
        if (autoCycle) {
            cycle = setInterval(() => {
                if (!isTransitioning) handleMove("right");
            }, cycleInterval);
        }
        return () => clearInterval(cycle);
    }, [autoCycle, cycleInterval, isTransitioning]);

    const handleMove = (dir) => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setDirection(dir);
        setActive((prev) => {
            if (dir === "left") return (prev - 1 + items.length) % items.length;
            return (prev + 1) % items.length;
        });

        setTimeout(() => setIsTransitioning(false), 500);
    };

    const generateItems = useCallback(() => {
        const elements = [];

        for (let i = active - 2; i < active + 3; i++) {
            let index = (i + items.length) % items.length;
            let level = active - i;

            elements.push(
                <CSSTransition
                    key={index}
                    classNames={{
                        enter: cx(`${direction}-enter`),
                        enterActive: cx(`${direction}-enter-active`),
                        exit: cx(`${direction}-exit`),
                        exitActive: cx(`${direction}-exit-active`),
                    }}
                    timeout={1000}
                    nodeRef={itemRefs.current[index]}
                >
                    <Item ref={itemRefs.current[index]} path={items[index]} level={level} />
                </CSSTransition>,
            );
        }

        return elements;
    }, [active, direction, items]);

    return (
        <div id={cx("carousel")} className={cx("noselect")}>
            <div className={cx("arrow", "arrow-left")} onClick={() => handleMove("left")}>
                <ChevronLeft />
            </div>
            <div className={cx("carousel-items")}>
                <TransitionGroup>{generateItems()}</TransitionGroup>
            </div>
            <div className={cx("arrow", "arrow-right")} onClick={() => handleMove("right")}>
                <ChevronRight />
            </div>
        </div>
    );
};

const Item = forwardRef(({ path, level }, ref) => {
    return (
        <div ref={ref} className={cx("item", `level${level}`)}>
            <img src={path} alt="Best seller image" />
        </div>
    );
});

export default Carousel;
