import React from 'react';

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
  return open ? (
    <div onClick={onClose} className={`${className}`}>
      {children}
    </div>
  ) : null;
};

export default CustomModal;
