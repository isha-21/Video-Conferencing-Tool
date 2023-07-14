import React from "react";
import RecordRTC from "recordrtc";
import "../../App.css";
import RecScrPrwModal from "./RecScrPrwModal";
import { Button, Row, Col, Container} from "reactstrap";
let recorder;

class ScreenRecording extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      RecVidLink: null,
      isOpenVideoModal: false,
      screen: null,
      camera: null,
      recorder: null,
      startDisable: false,
      stopDisable: true,
      loadModal: false,
    };
  }
  ClickCam = (cb) => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false, 
      })
      .then(cb);
  };
  BeginScrRec = async () => {
    await this.setState({ stopDisable: false, startDisable: true });
    this.ClickScr((screen) => {
      this.ClickCam(async (camera) => {
        screen.width = window.screen.width;
        screen.height = window.screen.height;
        screen.fullcanvas = true;
        camera.width = 320;
        camera.height = 240;
        camera.top = screen.height - camera.height;
        camera.left = screen.width - camera.width;
        this.setState({
          screen: screen,
          camera: camera,
        });
        recorder = RecordRTC([screen, camera], {
          type: "video",
        });
        recorder.startRecording();
        recorder.screen = screen;
      });
    });
  };
  ClickScr = (callback) => {
    this.invokeGetDisplayMedia(
      (screen) => {
        this.addStreamStopListener(screen, () => {});
        callback(screen);
      },
      (error) => {
        console.error(error);
        alert(
          "screen not clicked. check errors.\n" + error
        );
        this.setState({ stopDisable: true, startDisable: false });
      }
    );
  };
  VidStop = async (screen, camera) => {
    [screen, camera].forEach(async (stream) => {
      stream.getTracks().forEach(async (track) => {
        track.stop();
      });
    });
  };
  invokeGetDisplayMedia = (success, error) => {
    var displaymediastreamconstraints = {
      video: {
        displaySurface: "monitor", 
        logicalSurface: true,
        cursor: "always", 
      },
    };

    displaymediastreamconstraints = {
      video: true,
      audio: true,
    };
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia(displaymediastreamconstraints)
        .then(success)
        .catch(error);
    } else {
      navigator
        .getDisplayMedia(displaymediastreamconstraints)
        .then(success)
        .catch(error);
    }
  };

  addStreamStopListener = (stream, callback) => {
    stream.addEventListener(
      "ended",
      () => {
        callback();
        callback = () => {};
      },
      false
    );
    stream.addEventListener(
      "inactive",
      () => {
        callback();
        callback = () => {};
      },
      false
    );
    stream.getTracks().forEach((track) => {
      track.addEventListener(
        "ended",
        () => {
          callback();
          callback = () => {};
        },
        false
      );
      track.addEventListener(
        "inactive",
        () => {
          callback();
          callback = () => {};
        },
        false
      );
    });
    stream.getVideoTracks()[0].onended = () => {
      this.stop();
    };
  };
  stop = async () => {
    await this.setState({ startDisable: true });
    recorder.stopRecording(this.RecStopFn);
  };
  RecStopFn = async () => {
    await this.VidStop(this.state.screen, this.state.camera);
    let RecVidLink;
    if (recorder.getBlob()) {
      this.setState({
        recordPreview: recorder.getBlob(),
      });
      RecVidLink = URL.createObjectURL(recorder.getBlob());
    }
    this.setState({
      RecVidLink: RecVidLink,
      screen: null,
      isOpenVideoModal: true,
      startDisable: false,
      stopDisable: true,
      camera: null,
    });
    recorder.screen.stop();
    recorder.destroy();
    recorder = null;
  };
  VidStop = async (screen, camera) => {
    [screen, camera].forEach(async (stream) => {
      stream.getTracks().forEach(async (track) => {
        track.stop();
      });
    });
  };
  videoModalClose = () => {
    this.setState({
      isOpenVideoModal: false,
    });
  };
  openModal = async () => {
    await this.setState({ loadModal: false });
  };
  render() {
    window.onbeforeunload = this.openModal;
    return (
      <div>
        <Container className="pt-3">
          <div className="centerCard">
            <div>
              
                  <Row>
                    
                    <Col sm={12} className="text-center">
                      <Button
                        
                        className="btn-2"
                        outline
                        onClick={() => this.BeginScrRec()}
                        disabled={this.state.startDisable}
                      >
                        Begin Recording
                      </Button>
                      <Button
                        
                        className="btn-2"
                        outline
                        onClick={() => this.stop()}
                        disabled={this.state.stopDisable}
                      >
                        End Recording
                      </Button>
                      {this.state.startDisable && (
                        <h4 className="text-success pt-2">Recording..</h4>
                      )}
                      
                    </Col>
                  </Row>
                
            </div>
          </div>
          <RecScrPrwModal
            isOpenVideoModal={this.state.isOpenVideoModal}
            videoModalClose={this.videoModalClose}
            RecVidLink={this.state.RecVidLink}
            DnLdScrRecVid={this.DnLdScrRecVid}
            recorder={this.state.recordPreview}
          />
        </Container>
      </div>
    );
  }
}
export default ScreenRecording;
