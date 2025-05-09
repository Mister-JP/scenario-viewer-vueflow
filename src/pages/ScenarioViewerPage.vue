<script setup lang="ts">
import { VueFlow, useVueFlow, addEdge, MarkerType, type Connection, type Edge, type Node, type EdgeMouseEvent } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { Controls } from '@vue-flow/controls';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from '../stores/workspace';
import { useAuthStore } from '../stores/auth'; // Import auth store
import { computed, markRaw, nextTick, ref as vueRef } from 'vue';

import ScenarioCardNode from '../components/ScenarioCardNode.vue';
import MarkdownNode from '../components/MarkdownNode.vue';

// Workspace Store
const workspaceStore = useWorkspaceStore();
const { nodes, edges, hostUrl } = storeToRefs(workspaceStore);

// Auth Store
const authStore = useAuthStore();
const { isAuthenticated, user: loggedInUser } = storeToRefs(authStore); // Using storeToRefs for reactive access

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
    source: connectionParams.target!, // Reversed for intuitive drawing
    target: connectionParams.source!, // Reversed for intuitive drawing
    sourceHandle: connectionParams.targetHandle || undefined,
    targetHandle: connectionParams.sourceHandle || undefined,
    id: `e-${connectionParams.target}-${connectionParams.source}-${connectionParams.targetHandle || 'nodeTgtH'}-${connectionParams.sourceHandle || 'nodeSrcH'}-${Date.now()}`,
    label: '',
    markerEnd: MarkerType.ArrowClosed,
  };
  edges.value = addEdge(newEdge, edges.value) as Edge[];
};

const handleEdgeDoubleClick = (event: EdgeMouseEvent) => {
  const edgeToRemove = event.edge;
  if (edgeToRemove) {
    if (window.confirm(`Are you sure you want to delete the connection from "${edgeToRemove.source}" to "${edgeToRemove.target}"?`)) {
      workspaceStore.removeEdge(edgeToRemove.id);
    }
  }
};

const handleEditHostUrl = () => {
  const currentHost = hostUrl.value || 'http://localhost:8080';
  const newUrl = window.prompt('Enter new host URL:', currentHost);
  if (newUrl !== null) { // Check if user didn't cancel prompt
    workspaceStore.updateHostUrl(newUrl);
  }
};

const addNewScenarioNode = async () => {
  const existingScenarioNodesCount = nodes.value.filter(n => n.type === 'scenarioCard').length;
  const newNodeId = `scn-${existingScenarioNodesCount + 1}-${Date.now()}`;
  
  let scenarioIdentifier = window.prompt("Enter a Scenario ID (e.g., file name, descriptive_id):", `new-scenario-${existingScenarioNodesCount + 1}`);
  if (scenarioIdentifier === null) return; // User cancelled

  if (!scenarioIdentifier || scenarioIdentifier.trim() === "") {
    scenarioIdentifier = `scenario_${Date.now()}`; 
  } else {
    scenarioIdentifier = scenarioIdentifier.trim();
  }

  const newNodeData: ScenarioNodeData = { scenarioId: scenarioIdentifier };
  
  const newNode: AppNode = {
    id: newNodeId,
    type: 'scenarioCard',
    label: `Scenario: ${newNodeData.scenarioId}`,
    position: { x: 50 + (existingScenarioNodesCount % 4) * 400, y: 100 + Math.floor(existingScenarioNodesCount / 4) * 300 },
    data: newNodeData,
    style: { width: '350px', height: '250px' }
  };
  nodes.value.push(newNode as Node);
  await nextTick();
};

const addMarkdownNode = async () => {
  const existingMarkdownNodes = nodes.value.filter(n => n.type === 'markdownNode').length;
  const newNodeId = `md-${existingMarkdownNodes + 1}-${Date.now()}`;
  const newNode: AppNode = {
    id: newNodeId,
    type: 'markdownNode',
    position: { x: 100 + (existingMarkdownNodes % 4) * 300, y: 450 + Math.floor(existingMarkdownNodes / 4) * 250 },
    data: {
      markdownContent: `# New Note ${existingMarkdownNodes + 1}\n\nStart writing your thoughts here...`
    },
    style: { width: '250px', height: '180px' },
  };
  nodes.value.push(newNode as Node);
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
          
          nodes.value = loadedData.nodes.map((n: any): Node => ({
            ...n,
            position: { x: n.position?.x || 0, y: n.position?.y || 0 },
            data: n.data ? { ...n.data, scenarioId: n.data.scenarioId !== undefined ? String(n.data.scenarioId) : undefined } : {},
            style: n.style ? { ...n.style } : undefined,
            type: n.type || (n.data?.scenarioId ? 'scenarioCard' : (n.data?.markdownContent ? 'markdownNode' : undefined)),
            label: n.label || (n.data?.scenarioId ? `Scenario: ${n.data.scenarioId}`: undefined)
          }));

          edges.value = loadedData.edges.map((edge: any): Edge => ({
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

const handleLogout = () => {
  authStore.logout();
};

</script>

<template>
  <div class="w-screen h-screen flex flex-col bg-gray-800">
    <header class="bg-blue-600 text-white p-3 shadow-md flex justify-between items-center flex-shrink-0">
      <h1 class="text-lg font-semibold">Scenario Viewer</h1>
      <div class="flex items-center space-x-3"> <!-- Increased space-x for better separation -->
        <!-- User Info and Logout Button -->
        <div v-if="isAuthenticated && loggedInUser" class="flex items-center space-x-2">
          <span class="text-sm">
            Hi, {{ loggedInUser.username }}
          </span>
          <button
            @click="handleLogout"
            class="bg-red-500 hover:bg-red-700 text-white py-1 px-2 text-xs rounded font-medium" 
            title="Logout"
          >
            Logout
          </button>
        </div>
        <!-- End User Info and Logout Button -->

        <div class="flex items-center space-x-2"> <!-- Group for other controls -->
            <span class="text-sm">Host: {{ hostUrl }}</span>
            <button @click="handleEditHostUrl" class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 text-xs rounded font-medium">
            Edit Host
            </button>
            <button @click="addNewScenarioNode" class="bg-green-500 hover:bg-green-700 text-white py-1 px-2 text-xs rounded font-medium">
            Add Scenario
            </button>
            <button @click="addMarkdownNode" class="bg-teal-500 hover:bg-teal-700 text-white py-1 px-2 text-xs rounded font-medium">
            Add Note
            </button>
            <button @click="fitView({ padding: 0.1 })" class="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 text-xs rounded font-medium">
            Fit View
            </button>
            <button @click="saveLayout" class="bg-purple-500 hover:bg-purple-700 text-white py-1 px-2 text-xs rounded font-medium">
            Save Layout
            </button>
            <button @click="triggerLoadDialog" class="bg-yellow-500 hover:bg-yellow-700 text-black py-1 px-2 text-xs rounded font-medium">
            Load Layout
            </button>
        </div>
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
/* Styles should be in a separate file or scoped, but for completeness if they were here: */
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
/* Tailwind classes are preferred over .vue-flow__node-input */
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