import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  InteractiveFlow,
  ImageData,
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

const StyleSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 10px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
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

const StyleInfo = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #e3f2fd;
  border-radius: 6px;
  font-size: 12px;
  color: #1976d2;
`;

const StyleGroup = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const StyleGroupTitle = styled.h4`
  margin-bottom: 10px;
  color: #333;
  font-size: 14px;
  font-weight: bold;
`;

const CurrentStyleBadge = styled.div`
  margin-top: 8px;
  padding: 6px 10px;
  background: #e8f5e9;
  border-radius: 6px;
  font-size: 12px;
  color: #388e3c;
  display: inline-block;
`;

const ImagePathInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

interface StyleDefinition {
  id: string;
  name: string;
}

interface EnhancedEditorPanelProps {
  flow: InteractiveFlow | null;
  paragraphStyles: StyleDefinition[];
  textStyles: StyleDefinition[];
  onSave: (newText: string, images?: ImageData[], textStyleId?: string, paragraphStyleId?: string) => void;
}

const EnhancedEditorPanel: React.FC<EnhancedEditorPanelProps> = ({
  flow,
  paragraphStyles,
  textStyles,
  onSave,
}) => {
  const [text, setText] = useState<string>("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeTab, setActiveTab] = useState<"text" | "images" | "style">("text");
  const [selectedTextStyleId, setSelectedTextStyleId] = useState<string>("");
  const [selectedParagraphStyleId, setSelectedParagraphStyleId] = useState<string>("");
  const [newImagePath, setNewImagePath] = useState<string>("");
  const [newImageName, setNewImageName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (flow) {
      setText(flow.textContent);
      setImages(flow.images || []);
      // Use textStyleId and paragraphStyleId from the flow object
      setSelectedTextStyleId((flow as any).textStyleId || "");
      setSelectedParagraphStyleId((flow as any).paragraphStyleId || "");
    }
  }, [flow]);

  const handleAddImageReference = () => {
    if (!newImagePath.trim() || !newImageName.trim()) {
      alert("Please enter both image path and name");
      return;
    }

    const newImageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newImage: ImageData = {
      id: newImageId,
      name: newImageName,
      data: newImagePath,
      mimeType: getMimeTypeFromPath(newImagePath),
      width: 0,
      height: 0,
    };

    setImages([...images, newImage]);

    // Insert image marker into text
    const imageMarker = `[IMAGE:${newImageId}]`;
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.substring(0, start) + imageMarker + text.substring(end);
      setText(newText);
    } else {
      setText(text + (text ? "\n\n" : "") + imageMarker);
    }

    setNewImagePath("");
    setNewImageName("");
  };

  const getMimeTypeFromPath = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "png":
        return "image/png";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "gif":
        return "image/gif";
      case "svg":
        return "image/svg+xml";
      default:
        return "image/png";
    }
  };

  const handleRemoveImageReference = (imageId: string) => {
    setImages(images.filter((img) => img.id !== imageId));
    // Remove image markers from text
    const imageMarker = `[IMAGE:${imageId}]`;
    setText(text.replace(new RegExp(imageMarker, "g"), ""));
  };

  const handleSave = () => {
    onSave(text, images, selectedTextStyleId, selectedParagraphStyleId);
  };

  const getStyleName = (styleId: string, styles: StyleDefinition[]): string => {
    const style = styles.find((s) => s.id === styleId);
    return style ? `${style.name} (${style.id})` : "None selected";
  };

  // Render text with image placeholders for preview
  const renderPreviewText = () => {
    let previewText = text;
    images.forEach((img) => {
      previewText = previewText.replace(
        new RegExp(`\\[IMAGE:${img.id}\\]`, "g"),
        `[📷 ${img.name}]`
      );
    });
    return previewText || "Your content will appear here...";
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
          ID: {flow.id} | Type: {flow.type} | Interactive via: {flow.interactiveType}
          {images.length > 0 && ` | 🖼️ ${images.length} image(s)`}
        </p>
        {selectedParagraphStyleId && (
          <p style={{ fontSize: "12px", marginTop: "5px", color: "#667eea" }}>
            📄 Paragraph Style: {getStyleName(selectedParagraphStyleId, paragraphStyles)}
          </p>
        )}
        {selectedTextStyleId && (
          <p style={{ fontSize: "12px", marginTop: "5px", color: "#667eea" }}>
            ✏️ Text Style: {getStyleName(selectedTextStyleId, textStyles)}
          </p>
        )}
      </EditorHeader>

      <TabContainer>
        <Tab $active={activeTab === "text"} onClick={() => setActiveTab("text")}>
          📝 Text Editor
        </Tab>
        <Tab $active={activeTab === "images"} onClick={() => setActiveTab("images")}>
          🖼️ Images ({images.length})
        </Tab>
        <Tab $active={activeTab === "style"} onClick={() => setActiveTab("style")}>
          🎨 Style Selector
        </Tab>
      </TabContainer>

      {activeTab === "text" && (
        <div>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your content here... Use [IMAGE:imageId] to insert images. Use double line breaks for new paragraphs."
          />
          <StyleInfo>
            💡 <strong>Tip:</strong> Use [IMAGE:imageId] to insert images. Add images in the Images tab first, then copy the image ID from there.
          </StyleInfo>
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: "#f8f9fa",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            <strong>Preview (text only):</strong>
            <div style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>{renderPreviewText()}</div>
          </div>
        </div>
      )}

      {activeTab === "images" && (
        <div>
          <StyleGroup>
            <StyleGroupTitle>➕ Add Image Reference</StyleGroupTitle>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
              Enter the file path to your image on the server (e.g., D:/DBP_USER/AnkitSingh/templates/TPT logo.png)
            </p>
            <ImagePathInput
              type="text"
              placeholder="Image file path"
              value={newImagePath}
              onChange={(e) => setNewImagePath(e.target.value)}
            />
            <ImagePathInput
              type="text"
              placeholder="Image name (for reference)"
              value={newImageName}
              onChange={(e) => setNewImageName(e.target.value)}
            />
            <button
              onClick={handleAddImageReference}
              style={{
                width: "100%",
                padding: "8px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ➕ Add Image Reference
            </button>
            <StyleInfo style={{ marginTop: "10px" }}>
              💡 After adding, use <code>[IMAGE:{images.length > 0 ? images[0].id : "imageId"}]</code> in your text to insert the image.
            </StyleInfo>
          </StyleGroup>

          {images.length > 0 && (
            <>
              <StyleGroupTitle>📷 Your Image References ({images.length})</StyleGroupTitle>
              <ImagePreview>
                {images.map((img) => (
                  <ImageCard key={img.id}>
                    <div
                      style={{
                        width: "100%",
                        height: "120px",
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "4px",
                        fontSize: "48px",
                      }}
                    >
                      🖼️
                    </div>
                    <ImageName>{img.name}</ImageName>
                    <ImageName style={{ fontSize: "10px", color: "#999" }}>
                      {img.data.length > 40 ? img.data.substring(0, 40) + "..." : img.data}
                    </ImageName>
                    <DeleteImageBtn onClick={() => handleRemoveImageReference(img.id)}>
                      ×
                    </DeleteImageBtn>
                  </ImageCard>
                ))}
              </ImagePreview>
              <StyleInfo>
                <strong>Image Markers to use in text:</strong>
                <br />
                {images.map((img) => (
                  <code key={img.id} style={{ display: "block", marginTop: "5px" }}>
                    [IMAGE:{img.id}]
                  </code>
                ))}
              </StyleInfo>
            </>
          )}

          {images.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              No image references added yet. Use the form above to add image paths.
            </div>
          )}
        </div>
      )}

      {activeTab === "style" && (
        <div>
          <StyleGroup>
            <StyleGroupTitle>📄 Paragraph Style</StyleGroupTitle>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
              Select a paragraph style from your XML. This will be applied to the &lt;P&gt; tag.
            </p>
            <StyleSelect
              value={selectedParagraphStyleId}
              onChange={(e) => setSelectedParagraphStyleId(e.target.value)}
            >
              <option value="">-- Select Paragraph Style --</option>
              {paragraphStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name} ({style.id})
                </option>
              ))}
            </StyleSelect>
            {selectedParagraphStyleId && (
              <CurrentStyleBadge>
                ✅ Current: {getStyleName(selectedParagraphStyleId, paragraphStyles)}
              </CurrentStyleBadge>
            )}
          </StyleGroup>

          <StyleGroup>
            <StyleGroupTitle>✏️ Text Style</StyleGroupTitle>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
              Select a text style from your XML. This will be applied to the &lt;T&gt; tag.
            </p>
            <StyleSelect
              value={selectedTextStyleId}
              onChange={(e) => setSelectedTextStyleId(e.target.value)}
            >
              <option value="">-- Select Text Style --</option>
              {textStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name} ({style.id})
                </option>
              ))}
            </StyleSelect>
            {selectedTextStyleId && (
              <CurrentStyleBadge>
                ✅ Current: {getStyleName(selectedTextStyleId, textStyles)}
              </CurrentStyleBadge>
            )}
          </StyleGroup>

          <StyleInfo>
            <strong>📌 How It Works:</strong>
            <ul style={{ marginTop: "8px", marginLeft: "20px" }}>
              <li>The selected styles will be applied to the entire flow content</li>
              <li>Paragraph style goes to the &lt;P&gt; tag as <code>Id="{selectedParagraphStyleId || 'Def.ParaStyle'}"</code></li>
              <li>Text style goes to the &lt;T&gt; tag as <code>Id="{selectedTextStyleId || 'Def.TextStyleDelta'}"</code></li>
              <li>Image markers <code>[IMAGE:xxx]</code> become <code>&lt;O Id="xxx"/&gt;</code> tags</li>
            </ul>
          </StyleInfo>
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
          💾 Save All Changes {selectedParagraphStyleId && "✓"} {selectedTextStyleId && "✓"} ({images.length} image{images.length !== 1 ? "s" : ""})
        </button>
      </div>
    </PanelContainer>
  );
};

export default EnhancedEditorPanel;