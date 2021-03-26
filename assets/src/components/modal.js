import React from "react";
import Modal from "react-modal";
import VideoPlayer from "./video";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
// Modal.setAppElement('#yourAppElement')

export default function App({ modalIsOpen, file, closeModal }) {
  const videoOptions = {
    autoplay: false,
    controls: true,
    sources: [
      {
        src: file,
        type: "video/mp4",
      },
    ],
  };

  return (
    <div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Video"
        ariaHideApp={false}
      >
        <VideoPlayer {...videoOptions} />
      </Modal>
    </div>
  );
}
