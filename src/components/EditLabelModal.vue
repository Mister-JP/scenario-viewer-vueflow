<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  initialValue: string
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'save', value: string): void
  (e: 'cancel'): void
}>()

const editedValue = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Watch the initialValue prop to reset the local ref when a new edge is edited
watch(() => props.initialValue, (newValue) => {
  editedValue.value = newValue
})

// Watch the show prop to focus the textarea when the modal appears
watch(() => props.show, async (newShowState) => {
  if (newShowState) {
    editedValue.value = props.initialValue; // Ensure it resets on show
    await nextTick(); // Wait for the DOM to update (modal becomes visible)
    textareaRef.value?.focus(); // Focus the textarea
    textareaRef.value?.select(); // Optional: select existing text
  }
})

const save = () => {
  emit('save', editedValue.value)
}

const cancel = () => {
  emit('cancel')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
    @click.self="cancel"
  >
    <div class="bg-gray-700 p-6 rounded-lg shadow-xl w-full max-w-md flex flex-col">
      <h3 class="text-lg font-semibold mb-4 text-white">Edit Connection Label</h3>
      <textarea
        ref="textareaRef"
        v-model="editedValue"
        rows="5"
        class="w-full p-2 border border-gray-500 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 mb-4"
        placeholder="Enter label text (Markdown supported)"
      ></textarea>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancel"
          class="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
        >
          Cancel
        </button>
        <button
          @click="save"
          class="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Basic styling, adjust as needed */
</style>