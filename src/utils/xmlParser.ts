import { InteractiveFlow } from '../types/workflow.types';

// Detect Interactive Flows (SectionFlow = true or WebEditingType = Section)
export const detectInteractiveFlows = (xmlDoc: Document): InteractiveFlow[] => {
  const flows = xmlDoc.getElementsByTagName('Flow');
  const interactive: InteractiveFlow[] = [];
  
  for (let i = 0; i < flows.length; i++) {
    const flow = flows[i];
    const sectionFlow = flow.getElementsByTagName('SectionFlow')[0];
    const webEditingType = flow.getElementsByTagName('WebEditingType')[0];
    
    // Check if this is an interactive flow
    let isInteractive = false;
    let interactiveType = '';
    
    if (sectionFlow && sectionFlow.textContent === 'true') {
      isInteractive = true;
      interactiveType = 'SectionFlow';
    } else if (webEditingType && webEditingType.textContent === 'Section') {
      isInteractive = true;
      interactiveType = 'WebEditingType';
    }
    
    if (isInteractive) {
      // Get flow details - handle null values
      const idElement = flow.getElementsByTagName('Id')[0];
      const nameElement = flow.getElementsByTagName('Name')[0];
      const typeElement = flow.getElementsByTagName('Type')[0];
      
      // Safely get text content with fallback
      const flowId = idElement?.textContent || `flow-${i}`;
      const flowName = nameElement?.textContent || `Interactive Flow ${interactive.length + 1}`;
      const flowType = typeElement?.textContent || 'Simple';
      
      // Extract text content
      const flowContent = flow.getElementsByTagName('FlowContent')[0];
      let textContent = '';
      
      if (flowContent) {
        const pElements = flowContent.getElementsByTagName('P');
        for (let j = 0; j < pElements.length; j++) {
          const tElements = pElements[j].getElementsByTagName('T');
          for (let k = 0; k < tElements.length; k++) {
            const tContent = tElements[k].textContent || '';
            if (tContent.trim()) {
              textContent += tContent + '\n\n';
            }
          }
        }
        textContent = textContent.trim();
      }
      
      interactive.push({
        id: flowId,
        name: flowName,
        type: flowType,
        interactiveType: interactiveType,
        node: flow,
        flowContent: flowContent,
        textContent: textContent
      });
    }
  }
  
  return interactive;
};

// Update flow content
export const updateFlowContent = (flowNode: Element, newText: string, xmlDoc: Document): boolean => {
  const flowContent = flowNode.getElementsByTagName('FlowContent')[0];
  if (!flowContent) return false;
  
  // Clear existing content
  while (flowContent.firstChild) {
    flowContent.removeChild(flowContent.firstChild);
  }
  
  // Split text into paragraphs (double line breaks)
  const paragraphs = newText.split(/\n\n+/);
  
  // Create new P elements for each paragraph
  for (let i = 0; i < paragraphs.length; i++) {
    const p = xmlDoc.createElement('P');
    
    // Preserve P attributes from original if available
    const originalP = flowNode.getElementsByTagName('P')[0];
    if (originalP && originalP.getAttribute('Id')) {
      const idAttr = originalP.getAttribute('Id');
      if (idAttr) p.setAttribute('Id', idAttr);
    } else {
      p.setAttribute('Id', 'Def.ParaStyle');
    }
    
    // Create T element
    const t = xmlDoc.createElement('T');
    
    // Preserve T attributes
    const originalT = flowNode.getElementsByTagName('T')[0];
    if (originalT) {
      const idAttr = originalT.getAttribute('Id');
      if (idAttr) t.setAttribute('Id', idAttr);
      
      const spaceAttr = originalT.getAttribute('xml:space');
      if (spaceAttr) t.setAttribute('xml:space', spaceAttr);
    } else {
      t.setAttribute('Id', 'Def.TextStyleDelta');
      t.setAttribute('xml:space', 'preserve');
    }
    
    // Set the text content
    t.textContent = paragraphs[i];
    p.appendChild(t);
    flowContent.appendChild(p);
  }
  
  return true;
};

// Generate XML string from document
export const generateXmlString = (xmlDoc: Document): string => {
  const serializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(xmlDoc);
  
  // Add XML declaration if missing
  if (!xmlString.startsWith('<?xml')) {
    xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlString;
  }
  
  return xmlString;
};





// import { InteractiveFlow, ImageData, TextStyle, ParagraphStyle } from '../types/workflow.types';

// // Detect Interactive Flows (SectionFlow = true or WebEditingType = Section)
// export const detectInteractiveFlows = (xmlDoc: Document): InteractiveFlow[] => {
//   const flows = xmlDoc.getElementsByTagName('Flow');
//   const interactive: InteractiveFlow[] = [];
  
//   for (let i = 0; i < flows.length; i++) {
//     const flow = flows[i];
//     const sectionFlow = flow.getElementsByTagName('SectionFlow')[0];
//     const webEditingType = flow.getElementsByTagName('WebEditingType')[0];
    
//     let isInteractive = false;
//     let interactiveType = '';
    
//     if (sectionFlow && sectionFlow.textContent === 'true') {
//       isInteractive = true;
//       interactiveType = 'SectionFlow';
//     } else if (webEditingType && webEditingType.textContent === 'Section') {
//       isInteractive = true;
//       interactiveType = 'WebEditingType';
//     }
    
//     if (isInteractive) {
//       const idElement = flow.getElementsByTagName('Id')[0];
//       const nameElement = flow.getElementsByTagName('Name')[0];
//       const typeElement = flow.getElementsByTagName('Type')[0];
      
//       const flowId = idElement?.textContent || `flow-${i}`;
//       const flowName = nameElement?.textContent || `Interactive Flow ${interactive.length + 1}`;
//       const flowType = typeElement?.textContent || 'Simple';
      
//       const flowContent = flow.getElementsByTagName('FlowContent')[0];
//       let textContent = '';
      
//       // Extract text content and styles
//       let textStyles: TextStyle[] = [];
//       let paragraphStyles: ParagraphStyle[] = [];
      
//       if (flowContent) {
//         const pElements = flowContent.getElementsByTagName('P');
//         for (let j = 0; j < pElements.length; j++) {
//           const p = pElements[j];
//           const tElements = p.getElementsByTagName('T');
          
//           // Extract paragraph style
//           const pStyle: ParagraphStyle = {
//             marginTop: p.getAttribute('MarginTop') || '0',
//             marginBottom: p.getAttribute('MarginBottom') || '0',
//             lineHeight: p.getAttribute('LineHeight') || '1.5',
//             textAlign: (p.getAttribute('Align') as any) || 'left',
//             indent: p.getAttribute('Indent') || '0'
//           };
//           paragraphStyles.push(pStyle);
          
//           for (let k = 0; k < tElements.length; k++) {
//             const t = tElements[k];
//             const tContent = t.textContent || '';
//             if (tContent.trim()) {
//               textContent += tContent + '\n\n';
              
//               // Extract text style
//               const tStyle: TextStyle = {
//                 bold: t.getAttribute('Bold') === 'true',
//                 italic: t.getAttribute('Italic') === 'true',
//                 underline: t.getAttribute('Underline') === 'true',
//                 font: t.getAttribute('Font') || 'Arial',
//                 fontSize: t.getAttribute('FontSize') || '14px',
//                 color: t.getAttribute('Color') || '#000000',
//                 alignment: (t.getAttribute('Align') as any) || 'left'
//               };
//               textStyles.push(tStyle);
//             }
//           }
//         }
//         textContent = textContent.trim();
//       }
      
//       // Extract images from FlowContent
//       const images: ImageData[] = [];
//       if (flowContent) {
//         const imgElements = flowContent.getElementsByTagName('Image');
//         for (let j = 0; j < imgElements.length; j++) {
//           const img = imgElements[j];
//           const imgId = img.getAttribute('Id') || '';
//           const imgName = img.getAttribute('Name') || '';
//           const imgData = img.getAttribute('Data') || '';
//           const imgMimeType = img.getAttribute('MimeType') || 'image/png';
          
//           if (imgData) {
//             images.push({
//               id: imgId,
//               name: imgName,
//               data: imgData,
//               mimeType: imgMimeType
//             });
//           }
//         }
//       }
      
//       interactive.push({
//         id: flowId,
//         name: flowName,
//         type: flowType,
//         interactiveType: interactiveType,
//         node: flow,
//         flowContent: flowContent,
//         textContent: textContent,
//         images: images,
//         textStyle: textStyles[0] || {
//           bold: false,
//           italic: false,
//           underline: false,
//           font: 'Arial',
//           fontSize: '14px',
//           color: '#000000',
//           alignment: 'left'
//         },
//         paragraphStyle: paragraphStyles[0] || {
//           marginTop: '0',
//           marginBottom: '0',
//           lineHeight: '1.5',
//           textAlign: 'left',
//           indent: '0'
//         }
//       });
//     }
//   }
  
//   return interactive;
// };

// // Apply styles to text element
// const applyTextStyleToElement = (tElement: Element, style: TextStyle, xmlDoc: Document) => {
//   if (style.bold) tElement.setAttribute('Bold', 'true');
//   if (style.italic) tElement.setAttribute('Italic', 'true');
//   if (style.underline) tElement.setAttribute('Underline', 'true');
//   if (style.font) tElement.setAttribute('Font', style.font);
//   if (style.fontSize) tElement.setAttribute('FontSize', style.fontSize);
//   if (style.color) tElement.setAttribute('Color', style.color);
//   if (style.alignment) tElement.setAttribute('Align', style.alignment);
// };

// // Apply styles to paragraph element
// const applyParagraphStyleToElement = (pElement: Element, style: ParagraphStyle, xmlDoc: Document) => {
//   if (style.marginTop && style.marginTop !== '0') pElement.setAttribute('MarginTop', style.marginTop);
//   if (style.marginBottom && style.marginBottom !== '0') pElement.setAttribute('MarginBottom', style.marginBottom);
//   if (style.lineHeight && style.lineHeight !== '1.5') pElement.setAttribute('LineHeight', style.lineHeight);
//   if (style.textAlign && style.textAlign !== 'left') pElement.setAttribute('Align', style.textAlign);
//   if (style.indent && style.indent !== '0') pElement.setAttribute('Indent', style.indent);
// };

// // Create image element
// const createImageElement = (image: ImageData, xmlDoc: Document): Element => {
//   const imgElement = xmlDoc.createElement('Image');
//   imgElement.setAttribute('Id', image.id);
//   imgElement.setAttribute('Name', image.name);
//   imgElement.setAttribute('Data', image.data);
//   imgElement.setAttribute('MimeType', image.mimeType);
//   imgElement.setAttribute('Width', image.width?.toString() || '200');
//   imgElement.setAttribute('Height', image.height?.toString() || '150');
//   return imgElement;
// };

// // Update flow content with styles and images
// export const updateFlowContent = (
//   flowNode: Element, 
//   newText: string, 
//   xmlDoc: Document,
//   textStyle?: TextStyle,
//   paragraphStyle?: ParagraphStyle,
//   images?: ImageData[]
// ): boolean => {
//   const flowContent = flowNode.getElementsByTagName('FlowContent')[0];
//   if (!flowContent) return false;
  
//   // Clear existing content
//   while (flowContent.firstChild) {
//     flowContent.removeChild(flowContent.firstChild);
//   }
  
//   // Split text into paragraphs (double line breaks)
//   const paragraphs = newText.split(/\n\n+/);
  
//   // Add images first if they exist
//   if (images && images.length > 0) {
//     images.forEach(image => {
//       const imgElement = createImageElement(image, xmlDoc);
//       flowContent.appendChild(imgElement);
//     });
//   }
  
//   // Create new P elements for each paragraph with styles
//   for (let i = 0; i < paragraphs.length; i++) {
//     if (!paragraphs[i].trim()) continue;
    
//     const p = xmlDoc.createElement('P');
//     p.setAttribute('Id', `Def.ParaStyle_${i}`);
    
//     // Apply paragraph styles
//     if (paragraphStyle) {
//       applyParagraphStyleToElement(p, paragraphStyle, xmlDoc);
//     }
    
//     // Create T element for text
//     const t = xmlDoc.createElement('T');
//     t.setAttribute('Id', `Def.TextStyleDelta_${i}`);
//     t.setAttribute('xml:space', 'preserve');
    
//     // Apply text styles
//     if (textStyle) {
//       applyTextStyleToElement(t, textStyle, xmlDoc);
//     }
    
//     // Set the text content
//     t.textContent = paragraphs[i];
//     p.appendChild(t);
//     flowContent.appendChild(p);
//   }
  
//   return true;
// };

// // Generate XML string from document
// export const generateXmlString = (xmlDoc: Document): string => {
//   const serializer = new XMLSerializer();
//   let xmlString = serializer.serializeToString(xmlDoc);
  
//   // Add XML declaration if missing
//   if (!xmlString.startsWith('<?xml')) {
//     xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlString;
//   }
  
//   return xmlString;
// };

// // Function to embed images in base64 format
// export const embedImageAsBase64 = (file: File): Promise<ImageData> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const img = new Image();
//       img.onload = () => {
//         resolve({
//           id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//           name: file.name,
//           data: event.target?.result as string,
//           mimeType: file.type,
//           width: img.width,
//           height: img.height
//         });
//       };
//       img.onerror = reject;
//       img.src = event.target?.result as string;
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// };