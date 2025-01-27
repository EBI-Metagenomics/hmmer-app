import ReactModal from "react-modal";

export const Modal: React.FC = () => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
      style={modalStyle}
    >
      <div className="emg-modal-close">
        <button
          onClick={onRequestClose}
          className="vf-button vf-button--link"
          type="button"
        >
          <i className="icon icon-common icon-times" />
        </button>
      </div>
      {children}
    </ReactModal>
  );
};
