// src/stores/workspace.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core'
import { MarkerType } from '@vue-flow/core'

// Define a more specific type for ScenarioNode data if you want better type safety
interface ScenarioNodeData {
  scenarioId: string; // Changed from number to string
  [key: string]: any; // Allow other properties
}

interface MarkdownNodeData {
  markdownContent: string;
  [key: string]: any; // Allow other properties
}

// Update Node type to be more specific about its data payload
type AppNode = Omit<Node, 'data'> & {
  data?: ScenarioNodeData | MarkdownNodeData | Record<string, any>;
};


export const useWorkspaceStore = defineStore('workspace', () => {
  const hostUrl = ref<string>(localStorage.getItem('scenario-host') || 'http://localhost:8080')
  
  const nodes = ref<AppNode[]>([
    {
      id: 'scn-1',
      type: 'scenarioCard',
      position: { x: 50, y: 100 },
      data: { scenarioId: "default-scenario-1" },
      label: 'Scenario: default-scenario-1',
      style: { width: '350px', height: '250px' },
    },
    {
      id: 'scn-2',
      type: 'scenarioCard',
      position: { x: 450, y: 100 },
      data: { scenarioId: "another-example.file" },
      label: 'Scenario: another-example.file',
      style: { width: '350px', height: '250px' },
    },
    {
      id: 'md-1',
      type: 'markdownNode',
      position: { x: 50, y: 400 },
      data: {
        markdownContent: "## Welcome!\n\nThis is a **Markdown Note**.\n\n- Double-click to edit.\n- Resize me using the handle at the bottom-right.",
      },
      style: { width: '280px', height: '200px' },
    },
  ])
  const edges = ref<Edge[]>([
    {
      id: 'e-scn1-scn2',
      source: 'scn-1',
      target: 'scn-2',
      label: '',
      markerEnd: MarkerType.ArrowClosed,
    },
  ])

  function updateHostUrl(newUrl: string) {
    const trimmedUrl = newUrl.trim()
    if (!trimmedUrl) {
      console.error('updateHostUrl: New URL is empty, not updating.')
      return
    }
    const cleanUrl = trimmedUrl.replace(/\/$/, '')
    hostUrl.value = cleanUrl
    try {
      localStorage.setItem('scenario-host', cleanUrl)
    } catch (e) {
      console.error('Failed to save host URL to localStorage', e)
    }
  }

  function updateNodeScenarioId(nodeId: string, newScenarioId: string) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node && node.data && node.type === 'scenarioCard') {
      (node.data as ScenarioNodeData).scenarioId = newScenarioId;
      node.label = `Scenario: ${newScenarioId}`;
    }
  }

  function updateNodeData(nodeId: string, newData: Partial<any>) {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      console.log(`[Store] Updating node ${nodeId}. Current data:`, JSON.parse(JSON.stringify(nodes.value[nodeIndex].data)));
      console.log(`[Store] New data to merge for ${nodeId}:`, JSON.parse(JSON.stringify(newData)));

      const nodeToUpdate = nodes.value[nodeIndex];
      
      // Create a new data object by merging the old data with the new data.
      // newData should typically be { markdownContent: 'new user text' }
      const updatedData = { 
        ...(nodeToUpdate.data || {}), // Ensure nodeToUpdate.data is treated as an object
        ...newData 
      };

      // Replace the node object in the array with a new one, containing the updatedData.
      // This is crucial for Vue's reactivity to reliably pick up the change.
      nodes.value[nodeIndex] = {
        ...nodeToUpdate,
        data: updatedData,
      };
      console.log(`[Store] Node ${nodeId} updated. New data in store:`, JSON.parse(JSON.stringify(nodes.value[nodeIndex].data)));
    } else {
      console.error(`[Store] Node with id ${nodeId} not found for data update.`);
    }
  }

  function updateNodeDimensions(nodeId: string, width: number, height: number) {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      const nodeToUpdate = nodes.value[nodeIndex];
      const newStyle = {
        ...nodeToUpdate.style,
        width: `${width}px`,
        height: `${height}px`,
      };
      nodes.value[nodeIndex] = {
        ...nodeToUpdate,
        style: newStyle,
      };
    } else {
      console.error(`Node with id ${nodeId} not found for dimension update.`);
    }
  }

  function removeEdge(edgeIdToRemove: string) {
    edges.value = edges.value.filter(edge => edge.id !== edgeIdToRemove);
    console.log(`Removed edge: ${edgeIdToRemove}`);
  }

  return {
    hostUrl,
    nodes,
    edges,
    updateHostUrl,
    updateNodeScenarioId,
    updateNodeData,
    updateNodeDimensions,
    removeEdge,
  }
})