<script setup lang="ts">
import { VueFlow, useVueFlow, addEdge as addEdgeHelper, MarkerType, type Connection, type Edge, type Node, type EdgeDoubleClickEvent } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { Controls } from '@vue-flow/controls';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from '../stores/workspace';
import { computed, markRaw, nextTick, ref as vueRef } from 'vue';

import ScenarioCardNode from '../components/ScenarioCardNode.vue';
import MarkdownNode from '../components/MarkdownNode.vue';

const workspaceStore = useWorkspaceStore();
const { nodes, edges, hostUrl } = storeToRefs(workspaceStore);

// Re-define AppNode type or import from store if you made it exportable
interface ScenarioNodeData {
  scenarioId: string;
  [key: string]: any;
}
interface MarkdownNodeData {
  markdownContent: string;
  [key: string]: any;
}
type AppNode = Omit<Node, 'data'> & {
  data?: ScenarioNodeData | MarkdownNodeData | Record<string, any>;
};


const { fitView, onPaneReady, onNodeDragStop } = useVueFlow();

onPaneReady(async ({ fitView: fitViewInstance }) => {
  console.log('Vue Flow Pane is ready.');
  await nextTick();
  setTimeout(() => {
    fitViewInstance({ padding: 0.1 });
  }, 50);
});

const nodeTypes = computed(() => ({
  scenarioCard: markRaw(ScenarioCardNode),
  markdownNode: markRaw(MarkdownNode),
}));

const onConnect = (connectionParams: Connection) => {
  const newEdge: Edge = {
    source: connectionParams.target!,
    target: connectionParams.source!,
    sourceHandle: connectionParams.targetHandle || undefined,
    targetHandle: connectionParams.sourceHandle || undefined,
    id: `e-${connectionParams.target}-${connectionParams.source}-${connectionParams.targetHandle || 'nodeTgtH'}-${connectionParams.sourceHandle || 'nodeSrcH'}-${Date.now()}`,
    label: '',
    markerEnd: MarkerType.ArrowClosed,
  };
  edges.value = addEdgeHelper(newEdge, edges.value);
};

const handleEdgeDoubleClick = (event: EdgeDoubleClickEvent) => {
  const edgeToRemove = event.edge;
  if (edgeToRemove) {
    if (confirm(`Are you sure you want to delete the connection from "${edgeToRemove.source}" to "${edgeToRemove.target}"?`)) {
      workspaceStore.removeEdge(edgeToRemove.id);
    }
  }
};

const addNewScenarioNode = async () => {
  const existingScenarioNodesCount = nodes.value.filter(n => n.type === 'scenarioCard').length;
  const newNodeId = `scn-${existingScenarioNodesCount + 1}-${Date.now()}`;
  
  // Prompt for a scenario ID or generate one
  let scenarioIdentifier = prompt("Enter a Scenario ID (e.g., file name, descriptive_id):", `new-scenario-${existingScenarioNodesCount + 1}`);
  if (!scenarioIdentifier || scenarioIdentifier.trim() === "") {
    // If user cancels or enters empty, fallback to a generic ID or abort
    // For this example, let's use a default if cancelled/empty
    scenarioIdentifier = `scenario_${Date.now()}`; 
  } else {
    scenarioIdentifier = scenarioIdentifier.trim();
  }

  const newNodeData: ScenarioNodeData = { scenarioId: scenarioIdentifier };
  
  const newNode: AppNode = { // Use AppNode type
    id: newNodeId,
    type: 'scenarioCard',
    label: `Scenario: ${newNodeData.scenarioId}`, // Update label based on new string ID
    position: { x: 50 + (existingScenarioNodesCount % 4) * 400, y: 100 + Math.floor(existingScenarioNodesCount / 4) * 300 },
    data: newNodeData,
    style: { width: '350px', height: '250px' }
  };
  nodes.value.push(newNode as Node); // Cast back to Node for the store if AppNode isn't used directly in store's nodes ref type
  await nextTick();
};

const addMarkdownNode = async () => {
  const existingMarkdownNodes = nodes.value.filter(n => n.type === 'markdownNode').length;
  const newNodeId = `md-${existingMarkdownNodes + 1}-${Date.now()}`;
  const newNode: AppNode = { // Use AppNode type
    id: newNodeId,
    type: 'markdownNode',
    position: { x: 100 + (existingMarkdownNodes % 4) * 300, y: 450 + Math.floor(existingMarkdownNodes / 4) * 250 },
    data: {
      markdownContent: `# New Note ${existingMarkdownNodes + 1}\n\nStart writing your thoughts here...`
    },
    style: { width: '250px', height: '180px' },
  };
  nodes.value.push(newNode as Node); // Cast back
  await nextTick();
};


onNodeDragStop(({ node: draggedNodeInstance }) => {
  const storeNode = nodes.value.find(n => n.id === draggedNodeInstance.id);
  if (storeNode) {
    storeNode.position = { ...draggedNodeInstance.position };
  }
});

const fileInput = vueRef<HTMLInputElement | null>(null);

const saveLayout = () => {
  try {
    const nodesToSave = nodes.value.map(n => ({
      ...n,
      position: { ...n.position },
      // Ensure data is stringified correctly, especially if it now contains varied string IDs
      data: n.data ? JSON.parse(JSON.stringify(n.data)) : undefined,
      style: n.style ? JSON.parse(JSON.stringify(n.style)) : undefined,
    }));
    const layoutData = {
      hostUrl: hostUrl.value,
      nodes: nodesToSave,
      edges: JSON.parse(JSON.stringify(edges.value.map(edge => ({ ...edge, label: edge.label || '' })))),
    };
    const jsonString = JSON.stringify(layoutData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `scenario-layout-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    alert('Layout saved successfully!');
  } catch (error) {
    console.error('Failed to save layout:', error);
    alert('Error saving layout. See console for details.');
  }
};

const triggerLoadDialog = () => {
  fileInput.value?.click();
};

const handleFileLoad = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const loadedData = JSON.parse(content);

        if (
          loadedData &&
          typeof loadedData.hostUrl === 'string' &&
          Array.isArray(loadedData.nodes) &&
          Array.isArray(loadedData.edges)
        ) {
          workspaceStore.updateHostUrl(loadedData.hostUrl);
          // When loading, ensure scenarioId is treated as a string
          nodes.value = loadedData.nodes.map((n: any) => ({
            ...n,
            position: { x: n.position?.x || 0, y: n.position?.y || 0 },
            data: n.data ? { ...n.data, scenarioId: n.data.scenarioId !== undefined ? String(n.data.scenarioId) : undefined } : undefined,
            style: n.style ? { ...n.style } : undefined,
          }));
          edges.value = loadedData.edges.map((edge: any) => ({
            ...edge,
            markerEnd: edge.markerEnd || MarkerType.ArrowClosed,
            label: edge.label || '',
          }));
          await nextTick();
          fitView({ padding: 0.1 });
          alert('Layout loaded successfully!');
        } else {
          alert('Invalid layout file format.');
        }
      } catch (error) {
        console.error('Failed to load or parse layout file.', error);
        alert('Failed to load or parse layout file. See console for details.');
      } finally {
        if (fileInput.value) fileInput.value.value = '';
      }
    };
    reader.onerror = () => {
      alert('Failed to read file.');
      if (fileInput.value) fileInput.value.value = '';
    };
    reader.readAsText(file);
  }
};

</script>

<template>
  <div class="w-screen h-screen flex flex-col bg-gray-800">
    <header class="bg-blue-600 text-white p-3 shadow-md flex justify-between items-center flex-shrink-0">
      <h1 class="text-lg font-semibold">Scenario Viewer</h1>
      <div class="flex items-center space-x-2">
        <span class="text-sm">Host: {{ hostUrl }}</span>
        <button @click="workspaceStore.updateHostUrl(prompt('Enter new host URL:', hostUrl ? hostUrl : 'http://localhost:8080') || (hostUrl ? hostUrl : 'http://localhost:8080'))" class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 text-sm rounded">
          Edit Host
        </button>
        <button @click="addNewScenarioNode" class="bg-green-500 hover:bg-green-700 text-white py-1 px-2 text-sm rounded">
          Add Scenario Node
        </button>
        <button @click="addMarkdownNode" class="bg-teal-500 hover:bg-teal-700 text-white py-1 px-2 text-sm rounded">
          Add Markdown Note
        </button>
        <button @click="fitView({ padding: 0.1 })" class="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 text-sm rounded">
          Fit View
        </button>
        <button @click="saveLayout" class="bg-purple-500 hover:bg-purple-700 text-white py-1 px-2 text-sm rounded">
          Save Layout
        </button>
        <button @click="triggerLoadDialog" class="bg-yellow-500 hover:bg-yellow-700 text-black py-1 px-2 text-sm rounded">
          Load Layout
        </button>
      </div>
    </header>

    <input type="file" ref="fileInput" @change="handleFileLoad" accept=".json" style="display: none" />

    <div class="flex-grow relative vue-flow-container">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        @connect="onConnect"
        @edge-double-click="handleEdgeDoubleClick"
        :fit-view-on-init="false"
        class="basic-flow"
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.1"
        :max-zoom="4"
      >
        <Background :pattern-color="'#666'" :gap="20" />
        <MiniMap />
        <Controls />
      </VueFlow>
    </div>
  </div>
</template>

<style>
.vue-flow-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.vue-flow__minimap {
  transform: scale(0.75);
  transform-origin: bottom right;
  background-color: rgba(40, 40, 40, 0.8);
  border-radius: 4px;
}
.vue-flow__node-input {
 @apply bg-blue-700 border-blue-500 text-white rounded-lg shadow-xl;
  padding: 8px 12px;
  font-size: 12px;
}
.vue-flow__edge-path {
  stroke: #888;
  stroke-width: 2.5;
  transition: stroke-width 0.1s ease-in-out, stroke 0.1s ease-in-out;
}
.vue-flow__edge:hover .vue-flow__edge-path {
  stroke: #adadad;
  stroke-width: 3.5;
}
</style>