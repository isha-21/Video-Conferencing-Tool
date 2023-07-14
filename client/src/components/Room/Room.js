import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import styled from 'styled-components';
import socket from '../../socket';
import Vid_Details from '../Video/Vid_Details';
import FooterMenu from '../FooterMenu/FooterMenu';
import ScreenRecording from '../Recorder/ScreenRecording'

import Chat from '../Chat/Chat';

const Room = (props) => {
  const ActiveUser = sessionStorage.getItem('user');
  const [peers, setPeers] = useState([]);
    const [peerAV, setUserVideoAudio] = useState({
    localUser: { video: true, audio: true},
  });
  const [VidDev, setVideoDevices] = useState([]);
  const [ShowChat, setDisplayChat] = useState(false);
  const [ScrShr, setScreenShare] = useState(false);
  const [VidDevList, ChooseVidDev] = useState(false);
  const CallPeer = useRef([]);
  const UVidDetails = useRef();
  const TrkScrDetails = useRef();
  const UStream = useRef();
  const roomId = props.match.params.roomId;

  useEffect(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => device.kind === 'videoinput');
      setVideoDevices(filtered);
    });


    window.addEventListener('popstate', Prev);

      navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        UVidDetails.current.srcObject = stream;
        UStream.current = stream;
        socket.emit('BackEndEvent-join-room', { roomId, PName: ActiveUser });
        socket.on('FrontEvent-user-join', (users) => {
          
          
    
          const peers = [];
          users.forEach(({ userId, info }) => {
            let { PName, video, audio ,v_effect} = info;
            
            if (PName !== ActiveUser) {
              const peer = createPeer(userId, socket.id, stream);

              peer.PName = PName;
              peer.peerID = userId;
               

              CallPeer.current.push({
                peerID: userId,
                peer,
                PName,
               
              });
              peers.push(peer);

              setUserVideoAudio((preList) => {
                return {
                  ...preList,
                  [peer.PName]: { video, audio },
                };
              });
            }
          });

          setPeers(peers);
          
          
        });

        socket.on('FrontEvent-receive-call', ({ signal, from, info }) => {
          let { PName, video, audio } = info;
          const peerIdx = findPeer(from);

          if (!peerIdx) {
            const peer = addPeer(signal, from, stream);

            peer.PName = PName;

            CallPeer.current.push({
              peerID: from,
              peer,
              PName: PName,
            });
            setPeers((users) => {
              return [...users, peer];
            });
            setUserVideoAudio((preList) => {
              return {
                ...preList,
                [peer.PName]: { video, audio },
              };
            });
          }
        });

        socket.on('FrontEvent-call-accepted', ({ signal, answerId }) => {
          const peerIdx = findPeer(answerId);
          peerIdx.peer.signal(signal);
        });

        socket.on('FrontEvent-user-leave', ({ userId, PName }) => {
          const peerIdx = findPeer(userId);
          peerIdx.peer.destroy();
          setPeers((users) => {
            users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
            return [...users];
          });
        });
      });

    socket.on('FrontEvent-toggle-camera', ({ userId, switchTarget }) => {
      const peerIdx = findPeer(userId);

      setUserVideoAudio((preList) => {
        let video = preList[peerIdx.PName].video;
        let audio = preList[peerIdx.PName].audio;

        if (switchTarget === 'video') video = !video;
        else audio = !audio;

        return {
          ...preList,
          [peerIdx.PName]: { video, audio },
        };
      });
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  function createPeer(userId, caller, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('BackEndEvent-call-user', {
        userToCall: userId,
        from: caller,
        signal,
      });
    });
    peer.on('disconnect', () => {
      peer.destroy();
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('BackEndEvent-accept-call', { signal, to: callerId });
    });

    peer.on('disconnect', () => {
      peer.destroy();
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function findPeer(id) {
    return CallPeer.current.find((p) => p.peerID === id);
  }

  function createUserVideo(peer, index, arr) {
    return (
      <VideoBox
        className={`width-peer${peers.length > 8 ? '' : peers.length}`}
        onClick={expandScreen}
        key={index}
      >
        {DisplayUser(peer.PName)}
        <FaIcon className='fas fa-expand' />
        <Vid_Details key={index} peer={peer} effect={peer.v_effect} number={arr.length} />
      </VideoBox>
    );
  }

  function DisplayUser(PName, index) {
    if (peerAV.hasOwnProperty(PName)) {
      if (!peerAV[PName].video) {
        return <PName key={PName}>{PName}</PName>;
      }
    }
  }

  // Open Chat
  const GotoChat = (e) => {
    e.stopPropagation();
    setDisplayChat(!ShowChat);
  };

  // BackButton
  const Prev = (e) => {
    e.preventDefault();
    socket.emit('BackEndEvent-leave-room', { roomId, leaver: ActiveUser });
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  const AudioOnOff = (e) => {
    const target = e.target.getAttribute('data-switch');

    setUserVideoAudio((preList) => {
      let videoSwitch = preList['localUser'].video;
      let audioSwitch = preList['localUser'].audio;

      if (target === 'video') {
        const userVideoTrack = UVidDetails.current.srcObject.getVideoTracks()[0];
        videoSwitch = !videoSwitch;
        userVideoTrack.enabled = videoSwitch;
      } else {
        const userAudioTrack = UVidDetails.current.srcObject.getAudioTracks()[0];
        audioSwitch = !audioSwitch;

        if (userAudioTrack) {
          userAudioTrack.enabled = audioSwitch;
        } else {
          UStream.current.getAudioTracks()[0].enabled = audioSwitch;
        }
      }

      return {
        ...preList,
        localUser: { video: videoSwitch, audio: audioSwitch },
      };
    });

    socket.emit('BackEndEvent-toggle-camera-audio', { roomId, switchTarget: target });
  };

  const GoToScrShr = () => {
    if (!ScrShr) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];

          CallPeer.current.forEach(({ peer }) => {
            peer.replaceTrack(
              peer.streams[0]
                .getTracks()
                .find((track) => track.kind === 'video'),
              screenTrack,
              UStream.current
            );
          });

          screenTrack.onended = () => {
            CallPeer.current.forEach(({ peer }) => {
              peer.replaceTrack(
                screenTrack,
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === 'video'),
                UStream.current
              );
            });
            UVidDetails.current.srcObject = UStream.current;
            setScreenShare(false);
          };

          UVidDetails.current.srcObject = stream;
          TrkScrDetails.current = screenTrack;
          setScreenShare(true);
        });
    } else {
      TrkScrDetails.current.onended();
    }
  };

  const expandScreen = (e) => {
    const elem = e.target;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };

  const clickBackground = () => {
    if(!VidDevList) return;

    ChooseVidDev(false);
  }

  
 
  return (
    <BoxRoom onClick={clickBackground}>
    
      <ScreenRecording />
      <BoxVideoBar>
        <BoxVideo>
          {/* Current User Video */}
          <VideoBox
            className={`width-peer${peers.length > 8 ? '' : peers.length}`}
          >
            {peerAV['localUser'].video ? null : (
              <PName>{ActiveUser}</PName>
            )}
            <FaIcon className='fas fa-expand' />
            <MyVideo
              onClick={expandScreen}
              ref={UVidDetails}
              muted
              autoPlay
              playInline
              
            ></MyVideo>
          </VideoBox>
          {/* Joined User Vidoe */}
          {peers &&
            peers.map((peer, index, arr) => createUserVideo(peer, index, arr))}
        </BoxVideo>
        <FooterMenu
          GoToScrShr={GoToScrShr}
          GotoChat={GotoChat}
          Prev={Prev}
          AudioOnOff={AudioOnOff}
          peerAV={peerAV['localUser']}
          ScrShr={ScrShr}
          VidDev={VidDev}
          VidDevList={VidDevList}
          ChooseVidDev={ChooseVidDev}
          
        />
      </BoxVideoBar>
      <Chat display={ShowChat} roomId={roomId} />
    </BoxRoom>
  );
};

const BoxRoom = styled.div`
  display: flex;
  width: 100%;
  max-height: 100vh;
  flex-direction: row;
  background-color:#111;
`;

const BoxVideo = styled.div`
  max-width: 100%;
  height: 92%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;
  gap: 10px;
`;

const BoxVideoBar = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`;

const MyVideo = styled.video``;

const VideoBox = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  > video {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    
    
  }

  :hover {
    > i {
      display: block;
    }
  }
`;

const PName = styled.div`
  position: absolute;
  font-size: calc(20px + 5vmin);
  z-index: 1;
`;

const FaIcon = styled.i`
  display: none;
  position: absolute;
  right: 15px;
  top: 15px;
`;

export default Room;