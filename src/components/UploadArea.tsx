// import React, { useRef } from 'react';
// import styled from 'styled-components';

// const UploadContainer = styled.div`
//   border: 2px dashed #ddd;
//   border-radius: 12px;
//   padding: 40px;
//   text-align: center;
//   cursor: pointer;
//   transition: all 0.3s;
//   margin-bottom: 20px;

//   &:hover {
//     border-color: #667eea;
//     background: #f8f9ff;
//   }
// `;

// const UploadIcon = styled.div`
//   font-size: 48px;
//   margin-bottom: 10px;
// `;

// const FileInfo = styled.div`
//   background: #f0f2f5;
//   padding: 10px;
//   border-radius: 8px;
//   font-size: 13px;
//   color: #666;
//   margin-top: 10px;
// `;

// interface UploadAreaProps {
//   onFileLoad: (xmlDoc: Document, fileName: string) => void;
//   fileName: string | null;
// }

// const UploadArea: React.FC<UploadAreaProps> = ({ onFileLoad, fileName }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const processFile = (file: File) => {
//     const reader = new FileReader();
    
//     reader.onload = (e) => {
//       const parser = new DOMParser();
//       const xmlDoc = parser.parseFromString(e.target?.result as string, 'text/xml');
      
//       // Check for parsing errors
//       const parserError = xmlDoc.querySelector('parsererror');
//       if (parserError) {
//         alert('Invalid XML format');
//         return;
//       }
      
//       onFileLoad(xmlDoc, file.name);
//     };
    
//     reader.readAsText(file);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file && file.name.endsWith('.xml')) {
//       processFile(file);
//     } else {
//       alert('Please select an XML file');
//     }
//   };

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file && file.name.endsWith('.xml')) {
//       processFile(file);
//     } else {
//       alert('Please drop an XML file');
//     }
//   };

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//   };

//   return (
//     <UploadContainer
//       onClick={() => fileInputRef.current?.click()}
//       onDrop={handleDrop}
//       onDragOver={handleDragOver}
//     >
//       <UploadIcon>📁</UploadIcon>
//       <div>Click or drag XML file here</div>
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept=".xml"
//         style={{ display: 'none' }}
//         onChange={handleFileChange}
//       />
//       <FileInfo>
//         {fileName ? `✅ Loaded: ${fileName}` : 'No file selected'}
//       </FileInfo>
//     </UploadContainer>
//   );
// };

// export default UploadArea;





import React, { useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
  100% {
    border-color: #764ba2;
    background: rgba(118, 75, 162, 0.05);
  }
`;

const UploadContainer = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${props => props.$isDragging ? '#667eea' : '#d1d5db'};
  border-radius: 24px;
  padding: 50px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$isDragging ? 'rgba(102, 126, 234, 0.05)' : '#f9fafb'};
  animation: ${props => props.$isDragging ? pulse : 'none'} 0.6s ease infinite;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
    transform: translateY(-2px);
  }
`;

const UploadIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 2s ease infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const UploadTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
`;

const UploadSubtitle = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 15px;
`;

const FileInfo = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  color: #667eea;
  margin-top: 20px;
  font-weight: 500;
  display: inline-block;
  backdrop-filter: blur(10px);
`;

interface UploadAreaProps {
  onFileLoad: (xmlDoc: Document, fileName: string) => void;
  fileName: string | null;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileLoad, fileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(e.target?.result as string, 'text/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        alert('Invalid XML format');
        return;
      }
      
      onFileLoad(xmlDoc, file.name);
    };
    
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xml')) {
      processFile(file);
    } else {
      alert('Please select an XML file');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xml')) {
      processFile(file);
    } else {
      alert('Please drop an XML file');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <UploadContainer
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      $isDragging={isDragging}
    >
      <UploadIcon>📁</UploadIcon>
      <UploadTitle>Upload your Inspire XML file</UploadTitle>
      <UploadSubtitle>Drag & drop or click to browse</UploadSubtitle>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {fileName && (
        <FileInfo>
          ✅ {fileName}
        </FileInfo>
      )}
    </UploadContainer>
  );
};

export default UploadArea;