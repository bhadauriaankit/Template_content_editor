import { InteractiveFlow, ImageData } from '../types/workflow.types';

// Detect Interactive Flows (SectionFlow = true or WebEditingType = Section)
export const detectInteractiveFlows = (xmlDoc: Document): InteractiveFlow[] => {
  const flows = xmlDoc.getElementsByTagName('Flow');
  const interactive: InteractiveFlow[] = [];
  
  for (let i = 0; i < flows.length; i++) {
    const flow = flows[i];
    const sectionFlow = flow.getElementsByTagName('SectionFlow')[0];
    const webEditingType = flow.getElementsByTagName('WebEditingType')[0];
    
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
      const idElement = flow.getElementsByTagName('Id')[0];
      const nameElement = flow.getElementsByTagName('Name')[0];
      const typeElement = flow.getElementsByTagName('Type')[0];
      
      const flowId = idElement?.textContent || `flow-${i}`;
      const flowName = nameElement?.textContent || `Interactive Flow ${interactive.length + 1}`;
      const flowType = typeElement?.textContent || 'Simple';
      
      const flowContent = flow.getElementsByTagName('FlowContent')[0];
      let textContent = '';
      let currentTextStyleId = '';
      let currentParagraphStyleId = '';
      const imagesInFlow: ImageData[] = [];
      
      if (flowContent) {
        const pElements = flowContent.getElementsByTagName('P');
        for (let j = 0; j < pElements.length; j++) {
          const p = pElements[j];
          const tElements = p.getElementsByTagName('T');
          
          // Get paragraph style ID
          const pId = p.getAttribute('Id');
          if (pId) currentParagraphStyleId = pId;
          
          for (let k = 0; k < tElements.length; k++) {
            const t = tElements[k];
            
            // Extract text style ID
            const tId = t.getAttribute('Id');
            if (tId) currentTextStyleId = tId;
            
            // Extract text content and image references
            const children = t.childNodes;
            let paragraphText = '';
            
            for (let child of Array.from(children)) {
              if (child.nodeType === Node.TEXT_NODE) {
                paragraphText += child.textContent || '';
              } else if (child.nodeName === 'O') {
                const oElement = child as Element;
                const objectId = oElement.getAttribute('Id');
                if (objectId) {
                  // Check if this object ID corresponds to an image
                  const imageDef = findImageDefinition(xmlDoc, objectId);
                  if (imageDef) {
                    paragraphText += `[IMAGE:${objectId}]`;
                    imagesInFlow.push(imageDef);
                  } else {
                    paragraphText += `[OBJECT:${objectId}]`;
                  }
                }
              }
            }
            
            if (paragraphText.trim()) {
              textContent += paragraphText + '\n\n';
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
        textContent: textContent,
        images: imagesInFlow,
        textStyleId: currentTextStyleId,
        paragraphStyleId: currentParagraphStyleId
      });
    }
  }
  
  return interactive;
};

// Helper function to find image definition by ID
function findImageDefinition(xmlDoc: Document, imageId: string): ImageData | null {
  const images = xmlDoc.getElementsByTagName('Image');
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const idElement = img.getElementsByTagName('Id')[0];
    if (idElement && idElement.textContent === imageId) {
      const nameElement = img.getElementsByTagName('Name')[0];
      const locationElement = img.getElementsByTagName('ImageLocation')[0];
      
      return {
        id: imageId,
        name: nameElement?.textContent || 'Unknown',
        data: locationElement?.textContent || '',
        mimeType: 'image/png',
        width: 0,
        height: 0
      };
    }
  }
  return null;
}

// Update flow content with text and image references
export const updateFlowContent = (
  flowNode: Element, 
  newText: string, 
  xmlDoc: Document,
  textStyleId?: string,
  paragraphStyleId?: string,
  imageIds?: string[]
): boolean => {
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
    if (!paragraphs[i].trim()) continue;
    
    const p = xmlDoc.createElement('P');
    
    // Apply paragraph style
    if (paragraphStyleId) {
      p.setAttribute('Id', paragraphStyleId);
    } else {
      p.setAttribute('Id', 'Def.ParaStyle');
    }
    
    // Create T element
    const t = xmlDoc.createElement('T');
    t.setAttribute('xml:space', 'preserve');
    
    // Apply text style
    if (textStyleId) {
      t.setAttribute('Id', textStyleId);
    } else {
      t.setAttribute('Id', 'Def.TextStyleDelta');
    }
    
    // Parse paragraph text for image markers
    let paragraphText = paragraphs[i];
    const imageMarkers = paragraphText.match(/\[IMAGE:([^\]]+)\]/g);
    
    if (imageMarkers && imageMarkers.length > 0) {
      // Build content with mixed text and image references
      let lastIndex = 0;
      for (const marker of imageMarkers) {
        const markerIndex = paragraphText.indexOf(marker, lastIndex);
        // Add text before marker
        if (markerIndex > lastIndex) {
          const textNode = xmlDoc.createTextNode(paragraphText.substring(lastIndex, markerIndex));
          t.appendChild(textNode);
        }
        
        // Add image reference - Set Id attribute correctly
        const imageId = marker.match(/\[IMAGE:([^\]]+)\]/)?.[1];
        if (imageId) {
          const oElement = xmlDoc.createElement('O');
          // CRITICAL: Set the 'Id' attribute correctly
          oElement.setAttribute('Id', imageId);
          t.appendChild(oElement);
        }
        
        lastIndex = markerIndex + marker.length;
      }
      
      // Add remaining text
      if (lastIndex < paragraphText.length) {
        const textNode = xmlDoc.createTextNode(paragraphText.substring(lastIndex));
        t.appendChild(textNode);
      }
    } else {
      // Just plain text
      t.textContent = paragraphText;
    }
    
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

// Extract style definitions from XML
export const extractStyleDefinitions = (xmlString: string): { 
  paragraphStyles: Array<{ id: string; name: string }>;
  textStyles: Array<{ id: string; name: string }>;
} => {
  const paragraphStyles: Array<{ id: string; name: string }> = [];
  const textStyles: Array<{ id: string; name: string }> = [];
  
  // Extract ParaStyle definitions
  const paraBlocks = xmlString.match(/<ParaStyle>[\s\S]*?<\/ParaStyle>/g) || [];
  paraBlocks.forEach(block => {
    const idMatch = block.match(/<Id>(.*?)<\/Id>/i);
    const nameMatch = block.match(/<Name>(.*?)<\/Name>/i);
    if (idMatch && nameMatch) {
      paragraphStyles.push({ id: idMatch[1].trim(), name: nameMatch[1].trim() });
    }
  });
  
  // Extract TextStyle definitions
  const textBlocks = xmlString.match(/<TextStyle>[\s\S]*?<\/TextStyle>/g) || [];
  textBlocks.forEach(block => {
    const idMatch = block.match(/<Id>(.*?)<\/Id>/i);
    const nameMatch = block.match(/<Name>(.*?)<\/Name>/i);
    if (idMatch && nameMatch) {
      textStyles.push({ id: idMatch[1].trim(), name: nameMatch[1].trim() });
    }
  });
  
  return { paragraphStyles, textStyles };
};

// Get all available images from XML
export const getAllImages = (xmlDoc: Document): ImageData[] => {
  const images: ImageData[] = [];
  const imageElements = xmlDoc.getElementsByTagName('Image');
  
  for (let i = 0; i < imageElements.length; i++) {
    const img = imageElements[i];
    const idElement = img.getElementsByTagName('Id')[0];
    const nameElement = img.getElementsByTagName('Name')[0];
    const locationElement = img.getElementsByTagName('ImageLocation')[0];
    
    if (idElement) {
      images.push({
        id: idElement.textContent || `img-${i}`,
        name: nameElement?.textContent || 'Unnamed',
        data: locationElement?.textContent || '',
        mimeType: getMimeTypeFromPath(locationElement?.textContent || ''),
        width: 0,
        height: 0
      });
    }
  }
  
  return images;
};

// Helper to get mime type from file path
function getMimeTypeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    default: return 'image/png';
  }
}