import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const StatusDiv = styled.div<{ $type: string }>`
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  background: ${props => {
    switch (props.$type) {
      case 'success': return '#e8f5e9';
      case 'error': return '#ffebee';
      default: return '#e3f2fd';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#388e3c';
      case 'error': return '#d32f2f';
      default: return '#1976d2';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success': return '#388e3c';
      case 'error': return '#d32f2f';
      default: return '#1976d2';
    }
  }};
`;

interface StatusMessageProps {
  message: string;
  type: 'info' | 'success' | 'error';
  duration?: number;
  onHide?: () => void;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message, type, duration = 5000, onHide }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onHide?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onHide]);

  if (!visible) return null;

  return <StatusDiv $type={type}>{message}</StatusDiv>;
};

export default StatusMessage;