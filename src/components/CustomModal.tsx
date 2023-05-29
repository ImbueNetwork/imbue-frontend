import React from "react";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

const CustomModal = ({
  open,
  onClose,
  children,
  className,
}: CustomModalProps) => {
  const handleContentClick = (e: any) => {
    e?.stopPropagation();
  };

  return open ? (
    <div onClick={onClose} className={`${className}`}>
      <div
        className="flex justify-center items-center w-[100vw]"
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  ) : null;
};

export default CustomModal;
