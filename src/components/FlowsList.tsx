import React from 'react';
import styled from 'styled-components';
import { InteractiveFlow } from '../types/workflow.types';

const ListContainer = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
`;

const StatsBadge = styled.span`
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
`;

const FlowCard = styled.div<{ $selected: boolean }>`
  background: white;
  border: 2px solid ${props => props.$selected ? '#667eea' : '#e9ecef'};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$selected ? 'linear-gradient(135deg, #f0f4ff 0%, #fff 100%)' : 'white'};

  &:hover {
    transform: translateX(5px);
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const FlowName = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  font-size: 16px;
`;

const FlowId = styled.div`
  font-size: 11px;
  color: #999;
  margin-bottom: 5px;
`;

const FlowType = styled.div`
  font-size: 11px;
  color: #667eea;
  margin-bottom: 8px;
`;

const FlowPreview = styled.div`
  font-size: 12px;
  color: #666;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface FlowsListProps {
  flows: InteractiveFlow[];
  selectedIndex: number | null;
  onSelectFlow: (index: number) => void;
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const FlowsList: React.FC<FlowsListProps> = ({ flows, selectedIndex, onSelectFlow }) => {
  const getPreview = (text: string): string => {
    const preview = text.substring(0, 60);
    return preview + (text.length > 60 ? '...' : '');
  };

  return (
    <ListContainer>
      <ListHeader>
        <h3>📋 Interactive Flows</h3>
        <StatsBadge>{flows.length}</StatsBadge>
      </ListHeader>
      
      {flows.map((flow, index) => (
        <FlowCard
          key={flow.id}
          $selected={selectedIndex === index}
          onClick={() => onSelectFlow(index)}
        >
          <FlowName>{escapeHtml(flow.name)}</FlowName>
          <FlowId>ID: {flow.id}</FlowId>
          <FlowType>{flow.interactiveType} | Type: {flow.type}</FlowType>
          <FlowPreview>
            {getPreview(flow.textContent) || '(empty)'}
          </FlowPreview>
          <FlowType>
  {flow.interactiveType} | Type: {flow.type}
  {flow.images && flow.images.length > 0 && ` | 🖼️ ${flow.images.length} image(s)`}
</FlowType>
        </FlowCard>
        
      ))}
    </ListContainer>
  );
};

export default FlowsList;