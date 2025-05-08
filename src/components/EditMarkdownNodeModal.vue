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

watch(() => props.initialValue, (newValue) => {
  editedValue.value = newValue
})

watch(() => props.show, async (newShowState) => {
  if (newShowState) {
    editedValue.value = props.initialValue;
    await nextTick();
    textareaRef.value?.focus();
    // textareaRef.value?.select(); // Optional: select all text on focus
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
    class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
    @click.self="cancel"
  >
    <div class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl flex flex-col border border-gray-700">
      <h3 class="text-xl font-semibold mb-4 text-white">Edit Markdown Content</h3>
      <textarea
        ref="textareaRef"
        v-model="editedValue"
        rows="15"
        class="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 mb-6 text-sm"
        placeholder="Enter Markdown content..."
      ></textarea>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancel"
          class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm font-medium"
        >
          Cancel
        </button>
        <button
          @click="save"
          class="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
        >
          Save Content
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles if needed, but Tailwind is used primarily */
</style>