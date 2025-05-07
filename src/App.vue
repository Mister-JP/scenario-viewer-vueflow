<script setup lang="ts">
import { VueFlow, useVueFlow, addEdge as addEdgeHelper, MarkerType } from '@vue-flow/core'
import type { Connection, Edge, Node } from '@vue-flow/core' // Ensure Connection is imported
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from './stores/workspace'
import { computed, markRaw, nextTick } from 'vue'

// Import your custom node
import ScenarioCardNode from './components/ScenarioCardNode.vue'

const workspaceStore = useWorkspaceStore()
const { nodes, edges, hostUrl } = storeToRefs(workspaceStore)

const { fitView, onPaneReady, getViewport, getNodes, onNodeDragStop } = useVueFlow()

onPaneReady(async ({ fitView: fitViewInstance }) => {
  console.log('Vue Flow Pane is ready.');
  console.log('Viewport BEFORE fitView:', getViewport());

  await nextTick();

  setTimeout(() => {
    console.log('Fitting view with padding after slight delay.');
    fitViewInstance({ padding: 0.1 });
    setTimeout(() => {
      console.log('Viewport AFTER fitView attempt:', getViewport());
    }, 50)
  }, 50);
});

const nodeTypes = computed(() => ({
  scenarioCard: markRaw(ScenarioCardNode),
}))

const onConnect = (connectionParams: Connection) => {
  // Log the raw parameters received from the connect event
  console.log('Raw connectionParams from event:', JSON.parse(JSON.stringify(connectionParams)));
  // connectionParams.source is the ID of the node Vue Flow considers the source (e.g., where a 'source' type handle is)
  // connectionParams.target is the ID of the node Vue Flow considers the target (e.g., where a 'target' type handle is)

  // If the user drags from visual A to visual B, but the types of handles cause Vue Flow
  // to report source=B and target=A, then the arrow markerEnd (pointing to target)
  // would point to A, which is the reverse of the drag gesture.

  // To make the arrow ALWAYS follow the drag gesture:
  // We assume the user *wants* the arrow to point from the node represented by connectionParams.target (from Vue Flow's perspective)
  // to the node represented by connectionParams.source (from Vue Flow's perspective), if the arrow is currently reversed.
  // This effectively means the edge's logical source should be what Vue Flow called 'target' in the event,
  // and the edge's logical target should be what Vue Flow called 'source'.

  const newEdge: Edge = {
    // Swapping source and target from the connectionParams
    source: connectionParams.target!,       // This will be the tail of the arrow
    target: connectionParams.source!,       // This will be the head of the arrow
    sourceHandle: connectionParams.targetHandle || undefined, // Swap handles too
    targetHandle: connectionParams.sourceHandle || undefined, // Swap handles too
    id: `e-${connectionParams.target}-${connectionParams.source}-${connectionParams.targetHandle || 'nodeTgt'}-${connectionParams.sourceHandle || 'nodeSrc'}-${Date.now()}`,
    label: 'Connection',
    markerEnd: MarkerType.ArrowClosed, // Arrow head will point to the 'target' of this newEdge object
  };

  edges.value = addEdgeHelper(newEdge, edges.value);
  console.log('Created Edge (source/target potentially swapped to match gesture):', JSON.parse(JSON.stringify(newEdge)));
}

const addNewNode = async () => {
  console.log('--- addNewNode START ---');

  const viewportBefore = getViewport();
  console.log('Viewport BEFORE node add:', JSON.parse(JSON.stringify(viewportBefore)));

  const existingNodesBefore = JSON.parse(JSON.stringify(getNodes.value.map(n => ({
    id: n.id,
    position: n.position,
  }))));
  console.log('Existing nodes BEFORE add (from getNodes):', existingNodesBefore);

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
  console.log(`Pushed new node to store: ${newNodeId} with scenarioId ${newNodeData.scenarioId} at x:${newNode.position.x}, y:${newNode.position.y}`);

  await nextTick();

  const viewportAfter = getViewport();
  console.log('Viewport AFTER node add (and nextTick):', JSON.parse(JSON.stringify(viewportAfter)));

  const allNodesAfter = JSON.parse(JSON.stringify(getNodes.value.map(n => ({
    id: n.id,
    position: n.position,
  }))));
  console.log('All nodes AFTER add (from getNodes, and nextTick):', allNodesAfter);

  if (JSON.stringify(viewportBefore) !== JSON.stringify(viewportAfter)) {
    console.warn('ALERT: Viewport CHANGED after adding node!');
    console.log('Viewport Before:', viewportBefore);
    console.log('Viewport After:', viewportAfter);
  } else {
    console.log('INFO: Viewport did NOT change after adding node.');
  }

  let positionChanged = false;
  existingNodesBefore.forEach(nodeBefore => {
    const nodeAfter = allNodesAfter.find(n => n.id === nodeBefore.id);
    if (nodeAfter) {
      if (JSON.stringify(nodeBefore.position) !== JSON.stringify(nodeAfter.position)) {
        console.warn(`ALERT: Position of existing node ${nodeBefore.id} CHANGED:`);
        console.log(`  From:`, nodeBefore.position, `To:`, nodeAfter.position);
        positionChanged = true;
      }
    } else {
      console.error(`ERROR: Existing node ${nodeBefore.id} not found after adding new node! This is unexpected.`);
    }
  });

  if (!positionChanged && JSON.stringify(viewportBefore) === JSON.stringify(viewportAfter)) {
    console.log('INFO: Positions of existing nodes and viewport did NOT change.');
  } else if (!positionChanged && JSON.stringify(viewportBefore) !== JSON.stringify(viewportAfter)) {
    console.log('INFO: Positions of existing nodes did NOT change, but viewport did. The "reset" is likely due to viewport adjustment (e.g. fitView).');
  } else if (positionChanged) {
    console.log('INFO: Positions of existing nodes CHANGED. The "reset" is due to data mutation.');
  }
  console.log('--- addNewNode END ---');
};

onNodeDragStop(({ event, nodes: draggedNodesInfo, node: draggedNodeInstance }) => {
  console.log('Node Drag Stop Event:', {
    nodeId: draggedNodeInstance.id,
    newPosition: draggedNodeInstance.position,
  });

  const storeNode = nodes.value.find(n => n.id === draggedNodeInstance.id);
  if (storeNode) {
    storeNode.position = { ...draggedNodeInstance.position };
    console.log(`Updated position for node ${draggedNodeInstance.id} in Pinia store (via reactive ref) to:`, JSON.parse(JSON.stringify(storeNode.position)));
  } else {
    console.warn(`Node ${draggedNodeInstance.id} not found in Pinia store (nodes.value) during onNodeDragStop.`);
  }
});

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
        <button @click="addNewNode" class="bg-green-500 hover:bg-green-700 text-white py-1 px-2 text-sm rounded">
          Add Node
        </button>
        <button @click="fitView({ padding: 0.1 })" class="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 text-sm rounded">
          Fit View
        </button>
      </div>
    </header>

    <div class="flex-grow relative vue-flow-container">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        @connect="onConnect"
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
/* Ensure the Vue Flow container takes up all available space */
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

.vue-flow__node-input { /* For type: 'input' in initial store nodes, if any */
 @apply bg-blue-700 border-blue-500 text-white rounded-lg shadow-xl;
  padding: 8px 12px;
  font-size: 12px;
}

.vue-flow__edge-path {
  stroke: #888;
  stroke-width: 2;
}
.vue-flow__edge-text {
  fill: #ccc;
  font-size: 10px;
}
</style>