import React from 'react'
import moment from 'moment'
const Navbar = () => {

    const getTimeandDate = () =>{
        return moment().format("Do MMM yy, hh:mm:ss a");
    }
    return (
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <div className="container navbar-container">
        <div>
      
       <a class="navbar-brand" href="#">MULTI-USER VIDEO CONFERENCING    SYSTEM  </a>
       <h3> ROOMS  VIDEO/TEXTCHAT RECORD SCREEN SHARE CAM/SOUND-ON/OFF</h3>
       </div><span class="navbar-text">
            {getTimeandDate()}
            </span>
        </div>
    </nav>
    )
}

export default Navbar
