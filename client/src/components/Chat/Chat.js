import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import socket from '../../socket';

const Chat = ({ display, roomId }) => {
  const ActiveUser = sessionStorage.getItem('user');
  const [msg, setMsg] = useState([]);
  const CommEndPoint = useRef(null);
  const EntryPoint = useRef();
  
  useEffect(() => {
    socket.on('FrontEvent-receive-message', ({ msg, sender }) => {
      setMsg((msgs) => [...msgs, { sender, msg }]);
    });
  }, []);

  useEffect(() => {scrollToBottom()}, [msg])

  const scrollToBottom = () => {
    CommEndPoint.current.scrollIntoView({ behavior: 'smooth'});
  }

  const PostCommMsg = (e) => {
    if (e.key === 'Enter') {
      const msg = e.target.value;
      if (msg) {
        socket.emit('BackEndEvent-send-message', { roomId, msg, sender: ActiveUser });
        EntryPoint.current.value = '';
      }
    }
  };

  return (
    <BoxChat className={display ? '' : 'width0'}>
      <ToolHeader>MULTI-USER CHAT</ToolHeader>
      <BoxChatSpace>
        <ListingMsg>
          {msg &&
            msg.map(({ sender, msg }, idx) => {
              if (sender !== ActiveUser) {
                return (
                  <Message key={idx}>
                    <strong>{sender}</strong>
                    <p>{msg}</p>
                  </Message>
                );
              } else {
                return (
                  <CustomText key={idx}>
                    <strong>{sender}</strong>
                    <p>{msg}</p>
                  </CustomText>
                );
              }
            })}
            <div style={{float:'left', clear: 'both'}} ref={CommEndPoint} />
        </ListingMsg>
      </BoxChatSpace>
      <FooterData
        ref={EntryPoint}
        onKeyUp={PostCommMsg}
        placeholder="Put message"
      />
    </BoxChat>
  );
};

const BoxChat = styled.div`
  display: flex;
  flex-direction: column;
  width: 25%;
  /* height: 100%; */
  background-color: white;
  transition: all 0.5s ease;
  overflow: hidden;
`;

const ToolHeader = styled.div`
  width: 100%;
  margin-top: 15px;
  font-weight: 600;
  font-size: 20px;
  color: black;
`;

const BoxChatSpace = styled.div`
  width: 100%;
  height: 83%;
  max-height: 83%;
  overflow-x: hidden;
  overflow-y: auto;
`;

const ListingMsg = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 15px;
  color: #454552;
`;

const Message = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 16px;
  margin-top: 15px;
  margin-left: 15px;
  text-align: left;

  > strong {
    margin-left: 3px;
  }

  > p {
    max-width: 65%;
    width: auto;
    padding: 9px;
    margin-top: 3px;
    border: 1px solid rgb(78, 161, 211, 0.3);
    border-radius: 15px;
    box-shadow: 0px 0px 3px #4ea1d3;
    font-size: 14px;
  }
`;

const CustomText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  font-size: 16px;
  margin-top: 15px;
  text-align: right;

  > strong {
    margin-right: 35px;
  }

  > p {
    max-width: 65%;
    width: auto;
    padding: 9px;
    margin-top: 3px;
    margin-right: 30px;
    border: 1px solid rgb(78, 161, 211, 0.3);
    border-radius: 15px;
    background-color: #4ea1d3;
    color: white;
    font-size: 14px;
    text-align: left;
  }
`;

const FooterData = styled.input`
  bottom: 0;
  width: 100%;
  height: 8%;
  padding: 15px;
  border-top: 1px solid rgb(69, 69, 82, 0.25);
  box-sizing: border-box;
  opacity: 0.7;

  :focus {
    outline: none;
  }
`;

export default Chat;
