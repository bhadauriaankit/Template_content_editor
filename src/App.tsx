import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import UploadArea from './components/UploadArea';
import FlowsList from './components/FlowsList';
import EnhancedEditorPanel from './components/EnhancedEditorPanel';
import StatusMessage from './components/StatusMessage';
import { InteractiveFlow, ImageData, TextStyle, ParagraphStyle } from './types/workflow.types';
import { detectInteractiveFlows, updateFlowContent, generateXmlString } from './utils/xmlParser';

// Styled Components
const AppContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;

  h1 {
    color: #333;
    font-size: 28px;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    font-size: 14px;
  }
`;

const MainContent = styled.div<{ $visible: boolean }>`
  display: ${props => props.$visible ? 'grid' : 'none'};
  grid-template-columns: 350px 1fr;
  gap: 25px;
  margin-top: 25px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 20px;
`;

const DownloadButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  background: #28a745;
  color: white;

  &:hover {
    background: #218838;
    transform: translateY(-2px);
  }
`;

const App: React.FC = () => {
  const [xmlDoc, setXmlDoc] = useState<Document | null>(null);
  const [flows, setFlows] = useState<InteractiveFlow[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  const showStatus = (message: string, type: 'info' | 'success' | 'error') => {
    setStatus({ message, type });
  };

  const handleFileLoad = useCallback((doc: Document, name: string) => {
    const interactiveFlows = detectInteractiveFlows(doc);
    
    if (interactiveFlows.length === 0) {
      showStatus('No interactive flows found (SectionFlow="true" or WebEditingType="Section")', 'error');
      return;
    }
    
    setXmlDoc(doc);
    setFlows(interactiveFlows);
    setFileName(name);
    setSelectedIndex(0);
    showStatus(`✅ Loaded ${interactiveFlows.length} interactive flow(s) from ${name}`, 'success');
  }, []);

  const handleSelectFlow = useCallback((index: number) => {
    setSelectedIndex(index);
    showStatus(`Selected: ${flows[index].name}`, 'info');
  }, [flows]);

  const handleSaveFlow = useCallback((
    newText: string, 
    images?: ImageData[], 
    textStyle?: TextStyle, 
    paragraphStyle?: ParagraphStyle
  ) => {
    if (selectedIndex === null || !xmlDoc) return;
    
    const flow = flows[selectedIndex];
    
    // Update the text content in XML
    const success = updateFlowContent(flow.node, newText, xmlDoc);
    
    if (success) {
      // Update stored data
      const updatedFlows = [...flows];
      updatedFlows[selectedIndex] = {
        ...flow,
        textContent: newText,
        images: images || flow.images,
        textStyle: textStyle || flow.textStyle,
        paragraphStyle: paragraphStyle || flow.paragraphStyle
      };
      setFlows(updatedFlows);
      showStatus(`✅ Changes saved to "${flow.name}"`, 'success');
    } else {
      showStatus('Error saving changes', 'error');
    }
  }, [selectedIndex, flows, xmlDoc]);

  const handleDownload = useCallback(() => {
    if (!xmlDoc) {
      showStatus('No XML loaded', 'error');
      return;
    }
    
    try {
      const xmlString = generateXmlString(xmlDoc);
      const blob = new Blob([xmlString], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'updated-workflow.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showStatus('✅ XML downloaded successfully!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showStatus('Error downloading XML', 'error');
    }
  }, [xmlDoc]);

  const selectedFlow = selectedIndex !== null ? flows[selectedIndex] : null;

  return (
    <AppContainer>
      <Card>
        <Header>
          <h1>📄 Quadient Inspire - Enhanced Interactive Flows Editor</h1>
          <p>Upload XML, edit text with rich formatting, add images, and apply styles</p>
        </Header>

        <UploadArea onFileLoad={handleFileLoad} fileName={fileName} />

        <MainContent $visible={flows.length > 0}>
          <FlowsList
            flows={flows}
            selectedIndex={selectedIndex}
            onSelectFlow={handleSelectFlow}
          />
          
          <div>
            <EnhancedEditorPanel 
              flow={selectedFlow} 
              onSave={handleSaveFlow} 
            />
            
            {selectedFlow && (
              <ButtonGroup>
                <DownloadButton onClick={handleDownload}>⬇️ Download XML</DownloadButton>
              </ButtonGroup>
            )}
          </div>
        </MainContent>

        {status && (
          <StatusMessage
            message={status.message}
            type={status.type}
            onHide={() => setStatus(null)}
          />
        )}
      </Card>
    </AppContainer>
  );
};

export default App;