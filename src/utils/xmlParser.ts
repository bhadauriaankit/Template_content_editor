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





