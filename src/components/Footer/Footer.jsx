// import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { Box, Container } from "@mui/material";
=======
import { Container } from "@mui/material";
>>>>>>> 9c90712dccc044a47bf73e31d8c58470a2ead867

import styles from "./Footer.module.css";

const cx = classNames.bind(styles);

function Footer() {
  return (
    <div
      className={cx("footer")}
      style={{
        backgroundImage: `url(${require("@images/footer/footer.png")})`,
      }}
    >
<<<<<<< HEAD
     <Container maxWidth="lg">
       <div className={cx("footer-middle")}>
         <div className={cx("box-large")}>
         <div>
         <h3>We are <span className={cx("logo")}>Eatsy</span></h3><img src="" alt="" />
       
         <ul>
           <li>Something NEW is Coming, Stay up to date!</li>
           <input type="text" placeholder="Sent us your email" />
           <li><button className={cx("submit-button")}> Send </button></li>
           </ul>
      
         </div>
      
      
         </div>
         <div className={cx("box")}>
           <h3>Support</h3>
           <ul>
             <li>
               <Link> Drivers Download </Link>
             </li>
             <li>
               <Link> Track Your Order </Link>
             </li>
             <li>
               <Link> Shipping & Returns </Link>
             </li>
             <li>
               <Link> Customer Reviews </Link>
             </li>
           </ul>
         </div>
      
         <div className={cx("box")}>
           <h3>Get to know us</h3>
           <ul>
             <li>
               <Link> Security & Privacy</Link>
             </li>
             <li>
               <Link> Terms of Use </Link>
             </li>
             <li>
               <Link> Contact Us </Link>
             </li>
             <li>
               <Link> Talk with DISCORD </Link>
             </li>
           </ul>
         </div>
      
         <div className={cx("box")}>
           <h3>Follow us</h3>
           <ul>
             <li>eatsy63@gmail.com </li>
             <li>
            <img src={require("@images/social_icon/discord.png")} alt="" />
            <img src={require("@images/social_icon/facebook.png")} alt="" />
            <img src={require("@images/social_icon/instagram.png")} alt="" />
            <img src={require("@images/social_icon/twitter.png")} alt="" />
             </li>
           </ul>
         </div>
       </div>
       <div className={cx("footer-bottom")}>
         <hr />
       </div>
     </Container>
=======
      <Container maxWidth="lg">
        <div className={cx("footer-middle")}>
          <div className={cx("box-large")}>
            <div>
              <h3>
                We are <span className={cx("logo")}>Eatsy</span>
              </h3>
              <img src="" alt="" />

              <ul>
                <li>Something NEW is Coming, Stay up to date!</li>
                <input type="text" placeholder="Sent us your email" />
                <li>
                  <button className={cx("submit-button")}> Send </button>
                </li>
              </ul>
            </div>
          </div>
          <div className={cx("box")}>
            <h3>Support</h3>
            <ul>
              <li>
                <Link> Drivers Download </Link>
              </li>
              <li>
                <Link> Track Your Order </Link>
              </li>
              <li>
                <Link> Shipping & Returns </Link>
              </li>
              <li>
                <Link> Customer Reviews </Link>
              </li>
            </ul>
          </div>

          <div className={cx("box")}>
            <h3>Get to know us</h3>
            <ul>
              <li>
                <Link> Security & Privacy</Link>
              </li>
              <li>
                <Link> Terms of Use </Link>
              </li>
              <li>
                <Link> Contact Us </Link>
              </li>
              <li>
                <Link> Talk with DISCORD </Link>
              </li>
            </ul>
          </div>

          <div className={cx("box")}>
            <h3>Follow us</h3>
            <ul>
              <li>eatsy63@gmail.com </li>
              <li>
                <img src={require("@images/social_icon/discord.png")} alt="" />
                <img src={require("@images/social_icon/facebook.png")} alt="" />
                <img
                  src={require("@images/social_icon/instagram.png")}
                  alt=""
                />
                <img src={require("@images/social_icon/twitter.png")} alt="" />
              </li>
            </ul>
          </div>
        </div>
        <div className={cx("footer-bottom")}>
          <hr />
        </div>
      </Container>
>>>>>>> 9c90712dccc044a47bf73e31d8c58470a2ead867
    </div>
  );
}

export default Footer;
