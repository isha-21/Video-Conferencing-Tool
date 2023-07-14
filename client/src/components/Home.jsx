import React from 'react';
import {NavLink} from 'react-router-dom';

const Home = () => {
  return (
    <>
    <section style={{
      backgroundColor:'blue',
      width:'100%',
      height:'90vh'
    }}>
     <div className="box">
      
      <h1>WELCOME TO VIDEO CONFERENCING SYSTEM</h1>
          
      <h4>CREATE VIDEO COMMUNICATION ROOMS</h4>           
            <h4>MULTI-USER VIDEO CHAT</h4>             <h4>MULTI-USER TEXT CHAT</h4>
            <h4>MULTI-USER SCREEN SHARE</h4>            <h4>SCREEN RECORDING UTILITY</h4>
            <h4>CAMERA ON/OFF UTILITY</h4>            <h4>AUDIO ON/OFF UTILITY</h4>
            <h4>ROOM WISE AUTHENTICATED LOGIN</h4>
           
         
        
      <NavLink to="/profile" className="btn btn-warning">Get Started to Register or Login</NavLink>
     </div>
      
      
      </section>      
    </>
  )
}

export default Home;
