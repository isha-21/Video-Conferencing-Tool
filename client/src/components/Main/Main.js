import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import socket from '../../socket';
import Navbar from '../Navbar/Navbar';

const Main = (props) => {
  const RoomDetails = useRef();
  const UserDetails = useRef();
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {

    socket.on('FrontEvent-error-user-exist', ({ error }) => {
      if (!error) {
        const RName = RoomDetails.current.value;
        const PName = UserDetails.current.value;

        sessionStorage.setItem('user', PName);
        props.history.push(`/room/${RName}`);
      } else {
        setErr(error);
        setErrMsg('User name already exist');
      }
    });
  }, [props.history]);

  function clickJoin() {
    const RName = RoomDetails.current.value;
    const PName = UserDetails.current.value;

    if (!RName || !PName) {
      setErr(true);
      setErrMsg('Enter Room Name or User Name');
    } else {
      socket.emit('BackEndEvent-check-user', { roomId: RName, PName });
    }
  }

  return (
    <>
    <Navbar />
    <div className="container hompage">
        <div className="join-section">
        <div  className="info-section">
        <div>
        <img src="https://img.icons8.com/fluent/48/000000/conference-call.png" height='100px' width='100px' style={{marginRight:'5px'}} className="d-inline-block align-top" alt=""/>
          <h2>MUTI-USER VIDEO CONFERENCING</h2>
               </div>
          <div className="info-offers">
          <ul>
            <li>CREATE VIDEO COMMUNICATION ROOMS</li>
            <li>MULTI-USER VIDEO CHAT</li>             <li>MULTI-USER TEXT CHAT</li>
            <li>MULTI-USER SCREEN SHARE</li>            <li>SCREEN RECORDING UTILITY</li>
            <li>CAMERA ON/OFF UTILITY</li>            <li>AUDIO ON/OFF UTILITY</li>
            <li>ROOM WISE AUTHENTICATED LOGIN</li>
          </ul>           </div>
        </div>
        
        </div>
        <div  align = "center" className="form-container">
          <div className="form-group">
            <label htmlFor="RName">Name a Room</label>
            <Input id="RName" type='text' ref={RoomDetails} placeholder='Like Isha_Room or 1/2/3'/>
          </div>
          <div className="form-group">
          <Label htmlFor="PName">Input Your Name</Label>
          <Input type="text" id="PName" ref={UserDetails} placeholder='Like Isha' />
          </div>
          <ClickEnter onClick={clickJoin}> Enter Video Chat Room</ClickEnter>
      {err ? <Error>{errMsg}</Error> : null}
        </div>
       
      </div>
    
    </>
  );
};



const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 15px;
  line-height: 35px;
`;

const Label = styled.label`
text-align:right;
`;

const Input = styled.input`
  width: 150px;
  height: 35px;
  margin-left: 15px;
  padding-left: 10px;
  outline: none;
  border: none;
  border-radius: 5px;
  float: center;
`;

const Error = styled.div`
  margin-top: 10px;
  font-size: 20px;
  color: #e85a71;
`;

const ClickEnter = styled.button`
  width: 100%;
  height: 40px;
  margin-top: 35px;
  outline: none;
  border: none;
  border-radius: 5px;
  color: #d8e9ef;
  background-color: #4ea1d3;
  font-size: 20px;
  font-weight: 500;
  text-align: center;

  :hover {
    background-color: #7bb1d1;
    cursor: pointer;
  }
  :active{
    transform: scale(0.98)
  }
`;

export default Main;
