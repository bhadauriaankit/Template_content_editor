import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  InteractiveFlow,
  ImageData,
  TextStyle,
  ParagraphStyle,
} from "../types/workflow.types";

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
  background: ${(props) => (props.$active ? "#667eea" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "#666")};
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#667eea" : "#f0f2f5")};
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
  background: ${(props) => (props.$active ? "#667eea" : "white")};
  color: ${(props) => (props.$active ? "white" : "#333")};
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#667eea" : "#e9ecef")};
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
  font-family: "Courier New", monospace;
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
  onSave: (
    newText: string,
    images?: ImageData[],
    textStyle?: TextStyle,
    paragraphStyle?: ParagraphStyle,
  ) => void;
}

const EnhancedEditorPanel: React.FC<EnhancedEditorPanelProps> = ({
  flow,
  onSave,
}) => {
  const [text, setText] = useState<string>("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeTab, setActiveTab] = useState<"text" | "images" | "style">(
    "text",
  );
  const [textStyle, setTextStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    underline: false,
    font: "Arial",
    fontSize: "14px",
    color: "#000000",
    alignment: "left",
  });
  const [paragraphStyle, setParagraphStyle] = useState<ParagraphStyle>({
    marginTop: "0",
    marginBottom: "0",
    lineHeight: "1.5",
    textAlign: "left",
    indent: "0",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (flow) {
      setText(flow.textContent);
      setImages(flow.images || []);
      setTextStyle(
        flow.textStyle || {
          bold: false,
          italic: false,
          underline: false,
          font: "Arial",
          fontSize: "14px",
          color: "#000000",
          alignment: "left",
        },
      );
      setParagraphStyle(
        flow.paragraphStyle || {
          marginTop: "0",
          marginBottom: "0",
          lineHeight: "1.5",
          textAlign: "left",
          indent: "0",
        },
      );
    }
  }, [flow]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage: ImageData = {
            id: Date.now() + Math.random().toString(),
            name: file.name,
            data: event.target?.result as string,
            mimeType: file.type,
          };
          setImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Update the handleSave function to include images and styles
  const handleSave = () => {
    // Apply styles to the text content
    let styledText = text;

    // If we're applying styles at the paragraph level
    const styledParagraphs = text.split("\n\n").map((paragraph) => {
      let styledParagraph = paragraph;

      if (textStyle.bold)
        styledParagraph = `<strong>${styledParagraph}</strong>`;
      if (textStyle.italic) styledParagraph = `<em>${styledParagraph}</em>`;
      if (textStyle.underline) styledParagraph = `<u>${styledParagraph}</u>`;

      return styledParagraph;
    });

    const finalText = styledParagraphs.join("\n\n");

    // Pass all data to parent
    onSave(finalText, images, textStyle, paragraphStyle);
  };

  // Add preview section to show how the text will look
  const PreviewSection = styled.div`
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    background: #f8f9fa;

    h4 {
      margin-bottom: 10px;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }`;

  const PreviewContent = styled.div<{
    textStyle: TextStyle;
    paragraphStyle: ParagraphStyle;
  }>`
    font-family: ${(props) => props.textStyle.font || "Arial"};
    font-size: ${(props) => props.textStyle.fontSize || "14px"};
    color: ${(props) => props.textStyle.color || "#000000"};
    font-weight: ${(props) => (props.textStyle.bold ? "bold" : "normal")};
    font-style: ${(props) => (props.textStyle.italic ? "italic" : "normal")};
    text-decoration: ${(props) =>
      props.textStyle.underline ? "underline" : "none"};
    text-align: ${(props) => props.textStyle.alignment || "left"};
    margin-top: ${(props) => props.paragraphStyle.marginTop || "0"};
    margin-bottom: ${(props) => props.paragraphStyle.marginBottom || "0"};
    line-height: ${(props) => props.paragraphStyle.lineHeight || "1.5"};
    text-indent: ${(props) => props.paragraphStyle.indent || "0"};
    white-space: pre-wrap;
  `;


  

  // Apply styles to text
  const applyStyle = (style: keyof TextStyle, value?: any) => {
    setTextStyle({
      ...textStyle,
      [style]: value !== undefined ? value : !textStyle[style],
    });
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
        <p>
          ID: {flow.id} | Type: {flow.type} | Interactive via:{" "}
          {flow.interactiveType}
        </p>
      </EditorHeader>

      <TabContainer>
        <Tab
          $active={activeTab === "text"}
          onClick={() => setActiveTab("text")}
        >
          📝 Text Editor
        </Tab>
        <Tab
          $active={activeTab === "images"}
          onClick={() => setActiveTab("images")}
        >
          🖼️ Images ({images.length})
        </Tab>
        <Tab
          $active={activeTab === "style"}
          onClick={() => setActiveTab("style")}
        >
          🎨 Text Style
        </Tab>
      </TabContainer>

      {activeTab === "text" && (
        <div>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your content here..."
          />
        </div>
      )}

      {activeTab === "images" && (
        <div>
          <ImageUploadArea onClick={() => fileInputRef.current?.click()}>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>🖼️</div>
            <div>Click to upload images</div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
              Supported: JPG, PNG, GIF, SVG
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </ImageUploadArea>

          {images.length > 0 && (
            <ImagePreview>
              {images.map((img) => (
                <ImageCard key={img.id}>
                  <ImageElement src={img.data} alt={img.name} />
                  <ImageName>{img.name.substring(0, 20)}</ImageName>
                  <DeleteImageBtn onClick={() => handleRemoveImage(img.id)}>
                    ×
                  </DeleteImageBtn>
                </ImageCard>
              ))}
            </ImagePreview>
          )}
        </div>
      )}

      {activeTab === "style" && (
        <div>
          <h4 style={{ marginBottom: "10px" }}>Text Style</h4>
          <StyleControls>
            <ToolButton
              $active={textStyle.bold}
              onClick={() => applyStyle("bold")}
            >
              <strong>Bold</strong>
            </ToolButton>
            <ToolButton
              $active={textStyle.italic}
              onClick={() => applyStyle("italic")}
            >
              <em>Italic</em>
            </ToolButton>
            <ToolButton
              $active={textStyle.underline}
              onClick={() => applyStyle("underline")}
            >
              <u>Underline</u>
            </ToolButton>

            <Select
              value={textStyle.font}
              onChange={(e) => applyStyle("font", e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </Select>

            <Select
              value={textStyle.fontSize}
              onChange={(e) => applyStyle("fontSize", e.target.value)}
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
              onChange={(e) => applyStyle("color", e.target.value)}
            />

            <Select
              value={textStyle.alignment}
              onChange={(e) => applyStyle("alignment", e.target.value)}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </Select>
          </StyleControls>

          <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
            Paragraph Style
          </h4>
          <StyleControls>
            <div>
              <label>Margin Top: </label>
              <input
                type="text"
                value={paragraphStyle.marginTop}
                onChange={(e) =>
                  setParagraphStyle({
                    ...paragraphStyle,
                    marginTop: e.target.value,
                  })
                }
                placeholder="e.g., 10px, 1em"
                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label>Margin Bottom: </label>
              <input
                type="text"
                value={paragraphStyle.marginBottom}
                onChange={(e) =>
                  setParagraphStyle({
                    ...paragraphStyle,
                    marginBottom: e.target.value,
                  })
                }
                placeholder="e.g., 10px, 1em"
                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label>Line Height: </label>
              <input
                type="text"
                value={paragraphStyle.lineHeight}
                onChange={(e) =>
                  setParagraphStyle({
                    ...paragraphStyle,
                    lineHeight: e.target.value,
                  })
                }
                placeholder="e.g., 1.5, 20px"
                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
              />
            </div>
            <div>
              <label>Text Indent: </label>
              <input
                type="text"
                value={paragraphStyle.indent}
                onChange={(e) =>
                  setParagraphStyle({
                    ...paragraphStyle,
                    indent: e.target.value,
                  })
                }
                placeholder="e.g., 20px, 2em"
                style={{ width: "100%", padding: "5px", marginTop: "5px" }}
              />
            </div>
          </StyleControls>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "12px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          💾 Save All Changes
        </button>
      </div>
    </PanelContainer>
  );
};

export default EnhancedEditorPanel;








// import React, { useState, useEffect, useRef } from 'react';
// import styled from 'styled-components';
// import { InteractiveFlow, ImageData, TextStyle, ParagraphStyle } from '../types/workflow.types';

// const PanelContainer = styled.div`
//   background: white;
//   border-radius: 12px;
//   padding: 20px;
//   border: 1px solid #e9ecef;
//   box-shadow: 0 2px 8px rgba(0,0,0,0.05);
// `;

// const EditorHeader = styled.div`
//   margin-bottom: 20px;
//   padding-bottom: 15px;
//   border-bottom: 2px solid #e9ecef;

//   h3 {
//     color: #333;
//     margin-bottom: 5px;
//     font-size: 18px;
//   }

//   p {
//     color: #666;
//     font-size: 13px;
//   }
// `;

// const TabContainer = styled.div`
//   display: flex;
//   gap: 10px;
//   margin-bottom: 20px;
//   border-bottom: 2px solid #e9ecef;
// `;

// const Tab = styled.button<{ $active: boolean }>`
//   padding: 10px 20px;
//   background: ${props => props.$active ? '#667eea' : 'transparent'};
//   color: ${props => props.$active ? 'white' : '#666'};
//   border: none;
//   border-radius: 8px 8px 0 0;
//   cursor: pointer;
//   font-weight: bold;
//   transition: all 0.2s;

//   &:hover {
//     background: ${props => props.$active ? '#667eea' : '#f0f2f5'};
//   }
// `;

// const Toolbar = styled.div`
//   display: flex;
//   gap: 10px;
//   margin-bottom: 15px;
//   padding: 10px;
//   background: #f8f9fa;
//   border-radius: 8px;
//   flex-wrap: wrap;
// `;

// const ToolButton = styled.button<{ $active?: boolean }>`
//   padding: 8px 12px;
//   background: ${props => props.$active ? '#667eea' : 'white'};
//   color: ${props => props.$active ? 'white' : '#333'};
//   border: 1px solid #ddd;
//   border-radius: 6px;
//   cursor: pointer;
//   font-size: 14px;
//   transition: all 0.2s;

//   &:hover {
//     background: ${props => props.$active ? '#667eea' : '#e9ecef'};
//     transform: translateY(-1px);
//   }
// `;

// const ImageUploadArea = styled.div`
//   border: 2px dashed #ddd;
//   border-radius: 12px;
//   padding: 30px;
//   text-align: center;
//   margin: 15px 0;
//   cursor: pointer;
//   transition: all 0.3s;

//   &:hover {
//     border-color: #667eea;
//     background: #f8f9ff;
//     transform: translateY(-2px);
//   }
// `;

// const ImagePreview = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
//   gap: 15px;
//   margin: 15px 0;
// `;

// const ImageCard = styled.div`
//   position: relative;
//   border: 1px solid #ddd;
//   border-radius: 8px;
//   padding: 10px;
//   background: white;
//   transition: all 0.2s;

//   &:hover {
//     box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//     transform: translateY(-2px);
//   }
// `;

// const ImageElement = styled.img`
//   width: 100%;
//   height: 120px;
//   object-fit: cover;
//   border-radius: 4px;
// `;

// const ImageName = styled.div`
//   font-size: 12px;
//   margin-top: 5px;
//   text-align: center;
//   word-break: break-all;
//   color: #666;
// `;

// const DeleteImageBtn = styled.button`
//   position: absolute;
//   top: 5px;
//   right: 5px;
//   background: #ff4444;
//   color: white;
//   border: none;
//   border-radius: 50%;
//   width: 24px;
//   height: 24px;
//   cursor: pointer;
//   font-size: 12px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   transition: all 0.2s;

//   &:hover {
//     background: #cc0000;
//     transform: scale(1.1);
//   }
// `;

// const StyleControls = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
//   gap: 10px;
//   margin: 15px 0;
//   padding: 15px;
//   background: #f8f9fa;
//   border-radius: 8px;
// `;

// const Select = styled.select`
//   padding: 8px;
//   border: 1px solid #ddd;
//   border-radius: 6px;
//   font-size: 14px;
//   background: white;
//   cursor: pointer;

//   &:focus {
//     outline: none;
//     border-color: #667eea;
//   }
// `;

// const ColorInput = styled.input`
//   width: 100%;
//   height: 36px;
//   border: 1px solid #ddd;
//   border-radius: 6px;
//   cursor: pointer;

//   &:focus {
//     outline: none;
//     border-color: #667eea;
//   }
// `;

// const TextArea = styled.textarea`
//   width: 100%;
//   min-height: 300px;
//   padding: 15px;
//   font-family: 'Courier New', monospace;
//   font-size: 14px;
//   border: 2px solid #e9ecef;
//   border-radius: 8px;
//   resize: vertical;
//   margin: 15px 0;

//   &:focus {
//     outline: none;
//     border-color: #667eea;
//   }
// `;

// const PreviewSection = styled.div`
//   margin-top: 20px;
//   padding: 15px;
//   border: 1px solid #e9ecef;
//   border-radius: 8px;
//   background: #f8f9fa;
  
//   h4 {
//     margin-bottom: 10px;
//     color: #666;
//     font-size: 12px;
//     text-transform: uppercase;
//     letter-spacing: 1px;
//   }
// `;

// const PreviewContent = styled.div<{ $textStyle: TextStyle; $paragraphStyle: ParagraphStyle }>`
//   font-family: ${props => props.$textStyle.font || 'Arial'};
//   font-size: ${props => props.$textStyle.fontSize || '14px'};
//   color: ${props => props.$textStyle.color || '#000000'};
//   font-weight: ${props => props.$textStyle.bold ? 'bold' : 'normal'};
//   font-style: ${props => props.$textStyle.italic ? 'italic' : 'normal'};
//   text-decoration: ${props => props.$textStyle.underline ? 'underline' : 'none'};
//   text-align: ${props => props.$textStyle.alignment || 'left'};
//   margin-top: ${props => props.$paragraphStyle.marginTop || '0'};
//   margin-bottom: ${props => props.$paragraphStyle.marginBottom || '0'};
//   line-height: ${props => props.$paragraphStyle.lineHeight || '1.5'};
//   text-indent: ${props => props.$paragraphStyle.indent || '0'};
//   white-space: pre-wrap;
//   padding: 10px;
//   background: white;
//   border-radius: 6px;
//   min-height: 100px;
// `;

// const StyleLabel = styled.label`
//   display: block;
//   font-size: 11px;
//   color: #666;
//   margin-bottom: 5px;
//   font-weight: 500;
// `;

// const Input = styled.input`
//   width: 100%;
//   padding: 6px 8px;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   font-size: 12px;

//   &:focus {
//     outline: none;
//     border-color: #667eea;
//   }
// `;

// const SaveButton = styled.button`
//   width: 100%;
//   padding: 12px;
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   color: white;
//   border: none;
//   border-radius: 8px;
//   font-weight: bold;
//   cursor: pointer;
//   font-size: 14px;
//   transition: all 0.2s;

//   &:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
//   }

//   &:active {
//     transform: translateY(0);
//   }
// `;

// const ImageCountBadge = styled.span`
//   background: #667eea;
//   color: white;
//   padding: 2px 8px;
//   border-radius: 12px;
//   font-size: 12px;
//   margin-left: 8px;
// `;

// interface EnhancedEditorPanelProps {
//   flow: InteractiveFlow | null;
//   onSave: (newText: string, images?: ImageData[], textStyle?: TextStyle, paragraphStyle?: ParagraphStyle) => void;
// }

// const EnhancedEditorPanel: React.FC<EnhancedEditorPanelProps> = ({ flow, onSave }) => {
//   const [text, setText] = useState<string>('');
//   const [images, setImages] = useState<ImageData[]>([]);
//   const [activeTab, setActiveTab] = useState<'text' | 'images' | 'style'>('text');
//   const [textStyle, setTextStyle] = useState<TextStyle>({
//     bold: false,
//     italic: false,
//     underline: false,
//     font: 'Arial',
//     fontSize: '14px',
//     color: '#000000',
//     alignment: 'left'
//   });
//   const [paragraphStyle, setParagraphStyle] = useState<ParagraphStyle>({
//     marginTop: '0',
//     marginBottom: '0',
//     lineHeight: '1.5',
//     textAlign: 'left',
//     indent: '0'
//   });
  
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (flow) {
//       setText(flow.textContent);
//       setImages(flow.images || []);
//       setTextStyle(flow.textStyle || {
//         bold: false,
//         italic: false,
//         underline: false,
//         font: 'Arial',
//         fontSize: '14px',
//         color: '#000000',
//         alignment: 'left'
//       });
//       setParagraphStyle(flow.paragraphStyle || {
//         marginTop: '0',
//         marginBottom: '0',
//         lineHeight: '1.5',
//         textAlign: 'left',
//         indent: '0'
//       });
//     }
//   }, [flow]);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files) return;

//     Array.from(files).forEach(file => {
//       if (file.type.startsWith('image/')) {
//         const reader = new FileReader();
//         reader.onload = (event) => {
//           // Get image dimensions
//           const img = new Image();
//           img.onload = () => {
//             const newImage: ImageData = {
//               id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//               name: file.name,
//               data: event.target?.result as string,
//               mimeType: file.type,
//               width: img.width,
//               height: img.height
//             };
//             setImages(prev => [...prev, newImage]);
//           };
//           img.src = event.target?.result as string;
//         };
//         reader.readAsDataURL(file);
//       }
//     });
//   };

//   const handleRemoveImage = (imageId: string) => {
//     setImages(prev => prev.filter(img => img.id !== imageId));
//   };

//   const handleSave = () => {
//     // Pass all data to parent
//     onSave(text, images, textStyle, paragraphStyle);
//   };

//   // Apply styles to text
//   const applyStyle = (style: keyof TextStyle, value?: any) => {
//     if (style === 'bold' || style === 'italic' || style === 'underline') {
//       setTextStyle({ ...textStyle, [style]: !textStyle[style] });
//     } else {
//       setTextStyle({ ...textStyle, [style]: value });
//     }
//   };

//   // Reset all styles
//   const resetStyles = () => {
//     setTextStyle({
//       bold: false,
//       italic: false,
//       underline: false,
//       font: 'Arial',
//       fontSize: '14px',
//       color: '#000000',
//       alignment: 'left'
//     });
//     setParagraphStyle({
//       marginTop: '0',
//       marginBottom: '0',
//       lineHeight: '1.5',
//       textAlign: 'left',
//       indent: '0'
//     });
//   };

//   if (!flow) {
//     return (
//       <PanelContainer>
//         <EditorHeader>
//           <h3>Select a flow to edit</h3>
//           <p>Click on any flow from the left panel to start editing</p>
//         </EditorHeader>
//       </PanelContainer>
//     );
//   }

//   return (
//     <PanelContainer>
//       <EditorHeader>
//         <h3>✏️ Editing: {flow.name}</h3>
//         <p>
//           ID: {flow.id} | Type: {flow.type} | Interactive via: {flow.interactiveType}
//           {images.length > 0 && ` | 🖼️ ${images.length} image(s)`}
//         </p>
//       </EditorHeader>

//       <TabContainer>
//         <Tab $active={activeTab === 'text'} onClick={() => setActiveTab('text')}>
//           📝 Text Editor
//         </Tab>
//         <Tab $active={activeTab === 'images'} onClick={() => setActiveTab('images')}>
//           🖼️ Images <ImageCountBadge>{images.length}</ImageCountBadge>
//         </Tab>
//         <Tab $active={activeTab === 'style'} onClick={() => setActiveTab('style')}>
//           🎨 Style Editor
//         </Tab>
//       </TabContainer>

//       {activeTab === 'text' && (
//         <div>
//           <Toolbar>
//             <ToolButton
//               $active={textStyle.bold}
//               onClick={() => applyStyle('bold')}
//               title="Bold"
//             >
//               <strong>B</strong>
//             </ToolButton>
//             <ToolButton
//               $active={textStyle.italic}
//               onClick={() => applyStyle('italic')}
//               title="Italic"
//             >
//               <em>I</em>
//             </ToolButton>
//             <ToolButton
//               $active={textStyle.underline}
//               onClick={() => applyStyle('underline')}
//               title="Underline"
//             >
//               <u>U</u>
//             </ToolButton>
//             <Select
//               value={textStyle.font}
//               onChange={(e) => applyStyle('font', e.target.value)}
//               title="Font Family"
//             >
//               <option value="Arial">Arial</option>
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Courier New">Courier New</option>
//               <option value="Georgia">Georgia</option>
//               <option value="Verdana">Verdana</option>
//               <option value="Helvetica">Helvetica</option>
//             </Select>
//             <Select
//               value={textStyle.fontSize}
//               onChange={(e) => applyStyle('fontSize', e.target.value)}
//               title="Font Size"
//             >
//               <option value="12px">12px</option>
//               <option value="14px">14px</option>
//               <option value="16px">16px</option>
//               <option value="18px">18px</option>
//               <option value="20px">20px</option>
//               <option value="24px">24px</option>
//               <option value="28px">28px</option>
//               <option value="32px">32px</option>
//             </Select>
//             <ColorInput
//               type="color"
//               value={textStyle.color}
//               onChange={(e) => applyStyle('color', e.target.value)}
//               title="Text Color"
//             />
//             <Select
//               value={textStyle.alignment}
//               onChange={(e) => applyStyle('alignment', e.target.value)}
//               title="Text Alignment"
//             >
//               <option value="left">Left Align</option>
//               <option value="center">Center Align</option>
//               <option value="right">Right Align</option>
//               <option value="justify">Justify</option>
//             </Select>
//             <ToolButton onClick={resetStyles} title="Reset All Styles">
//               🔄 Reset
//             </ToolButton>
//           </Toolbar>

//           <TextArea
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             placeholder="Enter your content here... (Use double line breaks for new paragraphs)"
//           />
          
//           <PreviewSection>
//             <h4>📱 Live Preview</h4>
//             <PreviewContent $textStyle={textStyle} $paragraphStyle={paragraphStyle}>
//               {text || 'Your formatted content will appear here...'}
//             </PreviewContent>
//           </PreviewSection>
//         </div>
//       )}

//       {activeTab === 'images' && (
//         <div>
//           <ImageUploadArea onClick={() => fileInputRef.current?.click()}>
//             <div style={{ fontSize: '48px', marginBottom: '10px' }}>🖼️</div>
//             <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Click to upload images</div>
//             <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
//               Supported formats: JPG, PNG, GIF, SVG, WebP
//             </div>
//             <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
//               Images will be embedded in the XML as base64
//             </div>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               multiple
//               style={{ display: 'none' }}
//               onChange={handleImageUpload}
//             />
//           </ImageUploadArea>

//           {images.length > 0 && (
//             <>
//               <div style={{ marginTop: '15px', marginBottom: '10px', fontWeight: 'bold' }}>
//                 Uploaded Images ({images.length}):
//               </div>
//               <ImagePreview>
//                 {images.map(img => (
//                   <ImageCard key={img.id}>
//                     <ImageElement src={img.data} alt={img.name} />
//                     <ImageName>{img.name.length > 25 ? img.name.substring(0, 22) + '...' : img.name}</ImageName>
//                     {img.width && img.height && (
//                       <ImageName style={{ fontSize: '10px', color: '#999' }}>
//                         {img.width} x {img.height}
//                       </ImageName>
//                     )}
//                     <DeleteImageBtn onClick={() => handleRemoveImage(img.id)}>×</DeleteImageBtn>
//                   </ImageCard>
//                 ))}
//               </ImagePreview>
//             </>
//           )}

//           {images.length === 0 && (
//             <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
//               No images uploaded yet. Click the area above to add images.
//             </div>
//           )}
//         </div>
//       )}

//       {activeTab === 'style' && (
//         <div>
//           <h4 style={{ marginBottom: '10px', color: '#333' }}>Text Style Settings</h4>
//           <StyleControls>
//             <div>
//               <StyleLabel>Bold</StyleLabel>
//               <ToolButton
//                 $active={textStyle.bold}
//                 onClick={() => applyStyle('bold')}
//                 style={{ width: '100%' }}
//               >
//                 <strong>Bold Text</strong>
//               </ToolButton>
//             </div>
//             <div>
//               <StyleLabel>Italic</StyleLabel>
//               <ToolButton
//                 $active={textStyle.italic}
//                 onClick={() => applyStyle('italic')}
//                 style={{ width: '100%' }}
//               >
//                 <em>Italic Text</em>
//               </ToolButton>
//             </div>
//             <div>
//               <StyleLabel>Underline</StyleLabel>
//               <ToolButton
//                 $active={textStyle.underline}
//                 onClick={() => applyStyle('underline')}
//                 style={{ width: '100%' }}
//               >
//                 <u>Underline Text</u>
//               </ToolButton>
//             </div>
            
//             <div>
//               <StyleLabel>Font Family</StyleLabel>
//               <Select
//                 value={textStyle.font}
//                 onChange={(e) => applyStyle('font', e.target.value)}
//                 style={{ width: '100%' }}
//               >
//                 <option value="Arial">Arial</option>
//                 <option value="Times New Roman">Times New Roman</option>
//                 <option value="Courier New">Courier New</option>
//                 <option value="Georgia">Georgia</option>
//                 <option value="Verdana">Verdana</option>
//                 <option value="Helvetica">Helvetica</option>
//               </Select>
//             </div>
            
//             <div>
//               <StyleLabel>Font Size</StyleLabel>
//               <Select
//                 value={textStyle.fontSize}
//                 onChange={(e) => applyStyle('fontSize', e.target.value)}
//                 style={{ width: '100%' }}
//               >
//                 <option value="12px">12px (Small)</option>
//                 <option value="14px">14px (Normal)</option>
//                 <option value="16px">16px (Medium)</option>
//                 <option value="18px">18px (Large)</option>
//                 <option value="20px">20px (Extra Large)</option>
//                 <option value="24px">24px (Huge)</option>
//                 <option value="28px">28px (Massive)</option>
//                 <option value="32px">32px (Giant)</option>
//               </Select>
//             </div>
            
//             <div>
//               <StyleLabel>Text Color</StyleLabel>
//               <ColorInput
//                 type="color"
//                 value={textStyle.color}
//                 onChange={(e) => applyStyle('color', e.target.value)}
//               />
//             </div>
            
//             <div>
//               <StyleLabel>Alignment</StyleLabel>
//               <Select
//                 value={textStyle.alignment}
//                 onChange={(e) => applyStyle('alignment', e.target.value)}
//                 style={{ width: '100%' }}
//               >
//                 <option value="left">Left Align</option>
//                 <option value="center">Center Align</option>
//                 <option value="right">Right Align</option>
//                 <option value="justify">Justify</option>
//               </Select>
//             </div>
//           </StyleControls>

//           <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#333' }}>Paragraph Style Settings</h4>
//           <StyleControls>
//             <div>
//               <StyleLabel>Margin Top</StyleLabel>
//               <Input
//                 type="text"
//                 value={paragraphStyle.marginTop}
//                 onChange={(e) => setParagraphStyle({ ...paragraphStyle, marginTop: e.target.value })}
//                 placeholder="e.g., 10px, 1em, 0"
//               />
//             </div>
//             <div>
//               <StyleLabel>Margin Bottom</StyleLabel>
//               <Input
//                 type="text"
//                 value={paragraphStyle.marginBottom}
//                 onChange={(e) => setParagraphStyle({ ...paragraphStyle, marginBottom: e.target.value })}
//                 placeholder="e.g., 10px, 1em, 0"
//               />
//             </div>
//             <div>
//               <StyleLabel>Line Height</StyleLabel>
//               <Input
//                 type="text"
//                 value={paragraphStyle.lineHeight}
//                 onChange={(e) => setParagraphStyle({ ...paragraphStyle, lineHeight: e.target.value })}
//                 placeholder="e.g., 1.5, 20px, 1.2"
//               />
//             </div>
//             <div>
//               <StyleLabel>Text Indent</StyleLabel>
//               <Input
//                 type="text"
//                 value={paragraphStyle.indent}
//                 onChange={(e) => setParagraphStyle({ ...paragraphStyle, indent: e.target.value })}
//                 placeholder="e.g., 20px, 2em, 0"
//               />
//             </div>
//             <div>
//               <StyleLabel>Text Align</StyleLabel>
//               <Select
//                 value={paragraphStyle.textAlign}
//                 onChange={(e) => setParagraphStyle({ ...paragraphStyle, textAlign: e.target.value as any })}
//                 style={{ width: '100%' }}
//               >
//                 <option value="left">Left</option>
//                 <option value="center">Center</option>
//                 <option value="right">Right</option>
//                 <option value="justify">Justify</option>
//               </Select>
//             </div>
//           </StyleControls>

//           <div style={{ marginTop: '15px', padding: '12px', background: '#e3f2fd', borderRadius: '8px' }}>
//             <strong>💡 Tip:</strong> The styles you set here will be applied to all text in this flow.
//             You can see the live preview in the Text Editor tab.
//           </div>
//         </div>
//       )}

//       <div style={{ marginTop: '20px' }}>
//         <SaveButton onClick={handleSave}>
//           💾 Save All Changes ({images.length} image{images.length !== 1 ? 's' : ''})
//         </SaveButton>
//       </div>
//     </PanelContainer>
//   );
// };

// export default EnhancedEditorPanel;