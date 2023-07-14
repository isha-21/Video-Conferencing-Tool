import React, { useCallback } from 'react';
import styled from 'styled-components';
const FooterMenu = ({
  GotoChat,  Prev,  AudioOnOff,  peerAV,  GoToScrShr,  ScrShr,  
  VidDev,  VidDevList,  ChooseVidDev
}) => {
  const ToggleSet = useCallback(
    (e) => {
      ChooseVidDev((state) => !state);
    },
    [ChooseVidDev]
  );
    return (
    <Bar>
      <Left>
        <ClickCam onClick={AudioOnOff} data-switch='video'>
          <div>
            {peerAV.video ? (
              <FaIcon className='fas fa-video'></FaIcon>
            ) : (
              <FaIcon className='fas fa-video-slash'></FaIcon>
            )}
          </div>
          Camera
                  </ClickCam>
        {VidDevList && (
          <ChangeLst>
            {VidDev.length > 0 &&
              VidDev.map((device) => {
                console.log(device);
                return <div>{device.label}</div>;
              })}
            <div>Change Camera</div>
          </ChangeLst>
        )}
        <ChangeOptions onClick={ToggleSet}>
          <i className='fas fa-angle-up'></i>
        </ChangeOptions>
        <ClickCam onClick={AudioOnOff} data-switch='audio'>
          <div>
            {peerAV.audio ? (
              <FaIcon className='fas fa-microphone'></FaIcon>
            ) : (
              <FaIcon className='fas fa-microphone-slash'></FaIcon>
            )}
          </div>
          Sound
        </ClickCam>
      </Left>
      <Center>
        <ClickChat onClick={GotoChat}>
          <div>
            <FaIcon className='fas fa-comments'></FaIcon>
          </div>
          Text-Chat
        </ClickChat>
        <ScrClick onClick={GoToScrShr}>
          <div>
            <FaIcon
              className={`fas fa-desktop ${ScrShr ? 'sharing' : ''}`}
            ></FaIcon>
          </div>
          Screen Share Utility
        </ScrClick>
      </Center>
      <Right>
        <ClickStop onClick={Prev}>Stop</ClickStop>
      </Right>
    </Bar>
  );
};

const Bar = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 8%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  background-color: #333;
`;
const Left = styled.div`
  display: flex;
  align-items: center;

  margin-left: 15px;
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const Right = styled.div``;

const ClickChat = styled.div`
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }
`;

const ScrClick = styled.div`
  width: auto;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  .sharing {
    color: #ee2560;
  }
`;

const FaIcon = styled.i`
  width: 30px;
  font-size: calc(16px + 1vmin);
`;

const ClickStop = styled.div`
  width: 75px;
  height: 30px;
  border: none;
  font-size: 0.9375rem;
  line-height: 30px;
  margin-right: 15px;
  background-color: #ee2560;
  border-radius: 15px;

  :hover {
    background-color: #f25483;
    cursor: pointer;
  }
`;

const ClickCam = styled.div`
  position: relative;
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;

  :hover {
    background-color: #77b7dd;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }

  .fa-microphone-slash {
    color: #ee2560;
  }

  .fa-video-slash {
    color: #ee2560;
  }
`;


const ChangeOptions = styled.div`
  display: flex;
  position: absolute;
  width: 20px;
  top: 7px;
  left: 80px;
  z-index: 1;

  :hover {
    background-color: #476d84;
    cursor: pointer;
    border-radius: 15px;
  }

  * {
    pointer-events: none;
  }

  > i {
    width: 90%;
    font-size: calc(10px + 1vmin);
  }
`;

const ChangeLst = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: -115px;
  left: 80px;
  background-color: #4ea1d3;
  color: white;
  padding-top: 5px;
  padding-right: 10px;
  padding-bottom: 5px;
  padding-left: 10px;
  text-align: left;

  > div {
    font-size: 0.85rem;
    padding: 1px;
    margin-bottom: 5px;

    :not(:last-child):hover {
      background-color: #77b7dd;
      cursor: pointer;
    }
  }

  > div:last-child {
    border-top: 1px solid white;
    cursor: context-menu !important;
  }
`;

export default FooterMenu;