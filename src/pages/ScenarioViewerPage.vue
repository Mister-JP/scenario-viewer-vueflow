<script setup lang="ts">
import { VueFlow, useVueFlow, addEdge as addEdgeHelper, MarkerType, type Connection, type Edge, type Node, type EdgeMouseEvent } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { Controls } from '@vue-flow/controls';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from '../stores/workspace';
import { computed, markRaw, nextTick, ref as vueRef } from 'vue';

// Import components
import ScenarioCardNode from '../components/ScenarioCardNode.vue';
import EditLabelModal from '../components/EditLabelModal.vue';
import MarkdownLabel from '../components/MarkdownLabel.vue'; // Ensure this path is correct

const workspaceStore = useWorkspaceStore();
const { nodes, edges, hostUrl } = storeToRefs(workspaceStore);

const { fitView, onPaneReady, getViewport, getNodes, onNodeDragStop } = useVueFlow();

onPaneReady(async ({ fitView: fitViewInstance }) => {
  console.log('Vue Flow Pane is ready.');
  await nextTick();
  setTimeout(() => {
    console.log('Attempting to fit view in onPaneReady.');
    fitViewInstance({ padding: 0.1 });
  }, 50);
});

const nodeTypes = computed(() => ({
  scenarioCard: markRaw(ScenarioCardNode),
}));

// --- Edge Label Editing Modal State ---
const showEditModal = vueRef(false);
const editingEdgeId = vueRef<string | null>(null);
const currentEditText = vueRef('');
// ---

const onConnect = (connectionParams: Connection) => {
  console.log('Raw connectionParams from event:', JSON.parse(JSON.stringify(connectionParams)));

  const newEdge: Edge = {
    source: connectionParams.target!,
    target: connectionParams.source!,
    sourceHandle: connectionParams.targetHandle || undefined,
    targetHandle: connectionParams.sourceHandle || undefined,
    id: `e-${connectionParams.target}-${connectionParams.source}-${connectionParams.targetHandle || 'nodeTgt'}-${connectionParams.sourceHandle || 'nodeSrc'}-${Date.now()}`,
    label: 'New Connection', // Default label for new connections, can be Markdown
    markerEnd: MarkerType.ArrowClosed,
    // REMOVED: labelBgStyle, labelBgPadding, labelBgBorderRadius
  };
  edges.value = addEdgeHelper(newEdge, edges.value);
  console.log('Created Edge:', JSON.parse(JSON.stringify(newEdge)));
};

const addNewNode = async () => {
  console.log('--- addNewNode START ---');
  const newNodeId = `scn-${nodes.value.length + 1}-${Date.now()}`;
  const newNodeData = { scenarioId: nodes.value.length + 1 };
  const newNode: Node = {
    id: newNodeId,
    type: 'scenarioCard',
    label: `Scenario ${nodes.value.length + 1}`,
    position: { x: 50 + (nodes.value.length % 3) * 400, y: 400 + Math.floor(nodes.value.length / 3) * 300 },
    data: newNodeData
  };
  nodes.value.push(newNode);
  console.log(`Pushed new node to store: ${newNodeId}`);
  await nextTick(); // Wait for DOM update
  console.log('--- addNewNode END ---');
};

onNodeDragStop(({ node: draggedNodeInstance }) => {
  const storeNode = nodes.value.find(n => n.id === draggedNodeInstance.id);
  if (storeNode) {
    storeNode.position = { ...draggedNodeInstance.position };
    console.log(`Updated position for node ${draggedNodeInstance.id} in Pinia store.`);
  }
});

// --- START: Save and Load Layout ---
const fileInput = vueRef<HTMLInputElement | null>(null);

const saveLayout = () => {
  try {
    const nodesToSave = nodes.value.map(n => ({ ...n, position: { ...n.position } }));
    const layoutData = {
      hostUrl: hostUrl.value,
      nodes: nodesToSave,
      edges: JSON.parse(JSON.stringify(edges.value)),
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
    console.log('Layout saved.');
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
          nodes.value = loadedData.nodes.map((n: any) => ({
            ...n,
            position: { x: n.position?.x || 0, y: n.position?.y || 0 },
            data: { ...n.data },
          }));
          edges.value = loadedData.edges.map((edge: any) => ({
            ...edge,
            markerEnd: edge.markerEnd || MarkerType.ArrowClosed,
            label: edge.label || '',
            // REMOVED: labelBgStyle, labelBgPadding, etc.
          }));
          console.log('Layout loaded successfully.');
          await nextTick();
          fitView({ padding: 0.1 });
          alert('Layout loaded successfully!');
        } else {
          alert('Invalid layout file format.');
        }
      } catch (error) {
        alert('Failed to load or parse layout file.');
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
// --- END: Save and Load Layout ---

// --- START: Edge Label Editing ---
const onEdgeDoubleClick = (event: EdgeMouseEvent) => {
  const edge = event.edge;
  editingEdgeId.value = edge.id;
  currentEditText.value = typeof edge.label === 'string' ? edge.label : '';
  showEditModal.value = true;
};

const handleSaveLabel = (newLabel: string) => {
  if (editingEdgeId.value) {
    const edgeId = editingEdgeId.value;
    edges.value = edges.value.map(e =>
      e.id === edgeId ? { ...e, label: newLabel } : e
    );
    console.log(`Updated label for edge ${edgeId}`);
  }
  closeEditModal();
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingEdgeId.value = null;
  currentEditText.value = '';
};
// --- END: Edge Label Editing ---
</script>

<template>
  <div class="w-screen h-screen flex flex-col bg-gray-800">
    <header class="bg-blue-600 text-white p-3 shadow-md flex justify-between items-center flex-shrink-0">
      <!-- Header content -->
      <h1 class="text-lg font-semibold">Scenario Viewer</h1>
      <div class="flex items-center space-x-2">
        <span class="text-sm">Host: {{ hostUrl }}</span>
        <button @click="workspaceStore.updateHostUrl(prompt('Enter new host URL:', hostUrl ? hostUrl : 'http://localhost:8080') || (hostUrl ? hostUrl : 'http://localhost:8080'))" class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 text-sm rounded">
          Edit Host
        </button>
        <button @click="addNewNode" class="bg-green-500 hover:bg-green-700 text-white py-1 px-2 text-sm rounded">
          Add Node
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
        @edge-double-click="onEdgeDoubleClick"
        :fit-view-on-init="false"
        class="basic-flow"
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.1"
        :max-zoom="4"
      >
        <Background :pattern-color="'#666'" :gap="20" />
        <MiniMap />
        <Controls />

        <!-- Use the slot to render the edge label using our Markdown component -->
        <template #edge-label="props">
           <!-- TEMPORARY LOGGING: Uncomment to see props in console -->
           <!-- {{ console.log('Edge slot props for edge', props.id, ':', JSON.parse(JSON.stringify(props))) }} -->
           <MarkdownLabel :label="props.label" />
        </template>

      </VueFlow>
    </div>

    <!-- Edit Label Modal -->
    <EditLabelModal
      :show="showEditModal"
      :initial-value="currentEditText"
      @save="handleSaveLabel"
      @cancel="closeEditModal"
    />
  </div>
</template>

<style>
/* Container styles remain the same */
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

/* --- Edge Styling --- */
.vue-flow__edge-path {
  stroke: #888;
  stroke-width: 2.5;
  transition: stroke-width 0.1s ease-in-out, stroke 0.1s ease-in-out;
}
.vue-flow__edge:hover .vue-flow__edge-path {
  stroke: #adadad;
  stroke-width: 3.5;
}

/* --- Edge Label Styling --- */
/* Ensure the slotted label area is interactive for double-click */
.vue-flow__edge .vue-flow__edge-label {
  pointer-events: all; /* Make the foreignObject container interactive */
  cursor: pointer;
  /* No background here; MarkdownLabel handles its own */
}

/* Styling for the foreignObject wrapper provided by Vue Flow for the #edge-label slot */
/* --- TEMPORARILY COMMENTED OUT FOR DEBUGGING --- */

.vue-flow__edge-label foreignObject {
  overflow: visible !important;
  transform: translate(-50%, -50%);
  width: auto;
  height: auto;
}


/* Hide Vue Flow's default SVG text label if it somehow still renders */
.vue-flow__edge-text {
  display: none !important;
}
</style>