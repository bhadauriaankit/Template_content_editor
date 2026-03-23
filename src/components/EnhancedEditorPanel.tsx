import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { InteractiveFlow, ImageData, TextStyle, ParagraphStyle } from '../types/workflow.types';

const PanelContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
`;

const EditorHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;

  h3 {
    color: #333;
    margin-bottom: 5px;
  }

  p {
    color: #666;
    font-size: 13px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  background: ${props => props.$active ? '#667eea' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#667eea' : '#f0f2f5'};
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#667eea' : '#e9ecef'};
  }
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  margin: 15px 0;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
`;

const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin: 15px 0;
`;

const ImageCard = styled.div`
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  background: white;
`;

const ImageElement = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
`;

const ImageName = styled.div`
  font-size: 12px;
  margin-top: 5px;
  text-align: center;
  word-break: break-all;
`;

const DeleteImageBtn = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #cc0000;
  }
`;

const StyleControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
`;

const ColorInput = styled.input`
  width: 100%;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 400px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  resize: vertical;
  margin: 15px 0;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

interface EnhancedEditorPanelProps {
  flow: InteractiveFlow | null;
  onSave: (newText: string, images?: ImageData[], textStyle?: TextStyle, paragraphStyle?: ParagraphStyle) => void;
}

const EnhancedEditorPanel: React.FC<EnhancedEditorPanelProps> = ({ flow, onSave }) => {
  const [text, setText] = useState<string>('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'style'>('text');
  const [textStyle, setTextStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    underline: false,
    font: 'Arial',
    fontSize: '14px',
    color: '#000000',
    alignment: 'left'
  });
  const [paragraphStyle, setParagraphStyle] = useState<ParagraphStyle>({
    marginTop: '0',
    marginBottom: '0',
    lineHeight: '1.5',
    textAlign: 'left',
    indent: '0'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (flow) {
      setText(flow.textContent);
      setImages(flow.images || []);
      setTextStyle(flow.textStyle || {
        bold: false,
        italic: false,
        underline: false,
        font: 'Arial',
        fontSize: '14px',
        color: '#000000',
        alignment: 'left'
      });
      setParagraphStyle(flow.paragraphStyle || {
        marginTop: '0',
        marginBottom: '0',
        lineHeight: '1.5',
        textAlign: 'left',
        indent: '0'
      });
    }
  }, [flow]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage: ImageData = {
            id: Date.now() + Math.random().toString(),
            name: file.name,
            data: event.target?.result as string,
            mimeType: file.type
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSave = () => {
    onSave(text, images, textStyle, paragraphStyle);
  };

  // Apply styles to text
  const applyStyle = (style: keyof TextStyle, value?: any) => {
    setTextStyle({ ...textStyle, [style]: value !== undefined ? value : !textStyle[style] });
  };

  const getStyledText = () => {
    let styledText = text;
    if (textStyle.bold) styledText = `<strong>${styledText}</strong>`;
    if (textStyle.italic) styledText = `<em>${styledText}</em>`;
    if (textStyle.underline) styledText = `<u>${styledText}</u>`;
    return styledText;
  };

  if (!flow) {
    return (
      <PanelContainer>
        <EditorHeader>
          <h3>Select a flow to edit</h3>
          <p>Click on any flow from the left panel</p>
        </EditorHeader>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <EditorHeader>
        <h3>✏️ Editing: {flow.name}</h3>
        <p>ID: {flow.id} | Type: {flow.type} | Interactive via: {flow.interactiveType}</p>
      </EditorHeader>

      <TabContainer>
        <Tab $active={activeTab === 'text'} onClick={() => setActiveTab('text')}>
          📝 Text Editor
        </Tab>
        <Tab $active={activeTab === 'images'} onClick={() => setActiveTab('images')}>
          🖼️ Images ({images.length})
        </Tab>
        <Tab $active={activeTab === 'style'} onClick={() => setActiveTab('style')}>
          🎨 Text Style
        </Tab>
      </TabContainer>

      {activeTab === 'text' && (
        <div>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your content here..."
          />
        </div>
      )}

      {activeTab === 'images' && (
        <div>
          <ImageUploadArea onClick={() => fileInputRef.current?.click()}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🖼️</div>
            <div>Click to upload images</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
              Supported: JPG, PNG, GIF, SVG
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </ImageUploadArea>

          {images.length > 0 && (
            <ImagePreview>
              {images.map(img => (
                <ImageCard key={img.id}>
                  <ImageElement src={img.data} alt={img.name} />
                  <ImageName>{img.name.substring(0, 20)}</ImageName>
                  <DeleteImageBtn onClick={() => handleRemoveImage(img.id)}>×</DeleteImageBtn>
                </ImageCard>
              ))}
            </ImagePreview>
          )}
        </div>
      )}

      {activeTab === 'style' && (
        <div>
          <h4 style={{ marginBottom: '10px' }}>Text Style</h4>
          <StyleControls>
            <ToolButton
              $active={textStyle.bold}
              onClick={() => applyStyle('bold')}
            >
              <strong>Bold</strong>
            </ToolButton>
            <ToolButton
              $active={textStyle.italic}
              onClick={() => applyStyle('italic')}
            >
              <em>Italic</em>
            </ToolButton>
            <ToolButton
              $active={textStyle.underline}
              onClick={() => applyStyle('underline')}
            >
              <u>Underline</u>
            </ToolButton>
            
            <Select
              value={textStyle.font}
              onChange={(e) => applyStyle('font', e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </Select>
            
            <Select
              value={textStyle.fontSize}
              onChange={(e) => applyStyle('fontSize', e.target.value)}
            >
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
            </Select>
            
            <ColorInput
              type="color"
              value={textStyle.color}
              onChange={(e) => applyStyle('color', e.target.value)}
            />
            
            <Select
              value={textStyle.alignment}
              onChange={(e) => applyStyle('alignment', e.target.value)}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </Select>
          </StyleControls>

          <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Paragraph Style</h4>
          <StyleControls>
            <div>
              <label>Margin Top: </label>
              <input
                type="text"
                value={paragraphStyle.marginTop}
                onChange={(e) => setParagraphStyle({ ...paragraphStyle, marginTop: e.target.value })}
                placeholder="e.g., 10px, 1em"
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Margin Bottom: </label>
              <input
                type="text"
                value={paragraphStyle.marginBottom}
                onChange={(e) => setParagraphStyle({ ...paragraphStyle, marginBottom: e.target.value })}
                placeholder="e.g., 10px, 1em"
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Line Height: </label>
              <input
                type="text"
                value={paragraphStyle.lineHeight}
                onChange={(e) => setParagraphStyle({ ...paragraphStyle, lineHeight: e.target.value })}
                placeholder="e.g., 1.5, 20px"
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Text Indent: </label>
              <input
                type="text"
                value={paragraphStyle.indent}
                onChange={(e) => setParagraphStyle({ ...paragraphStyle, indent: e.target.value })}
                placeholder="e.g., 20px, 2em"
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </div>
          </StyleControls>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          💾 Save All Changes
        </button>
      </div>
    </PanelContainer>
  );
};

export default EnhancedEditorPanel;