<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
        <h3 class="text-2xl font-bold mb-4">Tasks</h3>

        <div class="mb-4">
            <label class="mr-2 font-semibold">Filter:</label>
            <select v-model="taskStore.filter" @change="taskStore.fetchTasks()" class="border rounded px-2 py-1">
                <option value="all">All</option>
                <option value="my">My Tasks</option>
                <option value="shared">Shared</option>
            </select>
        </div>

        <!-- Loading State -->
        <div v-if="taskStore.loading">Loading tasks...</div>

        <!-- Empty State -->
        <div v-else-if="taskStore.tasks.length === 0" class="text-gray-500 italic">
            No tasks to show in this view.
        </div>

        <!-- Tasks List -->
        <ul v-else class="space-y-2">
            <li v-for="task in taskStore.tasks" :key="task.id" class="border p-4 rounded shadow-sm">
                <h2 class="font-semibold text-lg">{{ task.title }}</h2>
                <p class="text-sm text-gray-600">{{ task.description }}</p>
            </li>
        </ul>

        <button
    @click="openModal"
    class="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
  >
    +
  </button>

  <!-- Modal -->
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded p-6 w-full max-w-md shadow-xl">
      <h2 class="text-lg font-bold mb-4">Create Task</h2>

      <input
        v-model="newTitle"
        type="text"
        placeholder="Title"
        class="w-full border p-2 rounded mb-2"
      />
      <textarea
        v-model="newDesc"
        placeholder="Description"
        class="w-full border p-2 rounded mb-4"
      ></textarea>

      <div class="flex justify-end gap-2">
        <button @click="showModal = false" class="px-4 py-2 border rounded">Cancel</button>
        <button @click="create" class="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
      </div>
    </div>
  </div>
        <button @click="logout" class="mt-4 px-4 py-2 bg-red-500 text-white rounded">
            Logout
        </button>
    </div>
</template>

<script setup lang="ts">
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useTaskStore } from '../store/task';

const router = useRouter();
const showModal = ref(false);
const newTitle = ref('');
const newDesc = ref('');

const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    router.push('/login');
};

const taskStore = useTaskStore();

const openModal = () => {
  newTitle.value = '';
  newDesc.value = '';
  showModal.value = true;
};

const create = async () => {
  if (!newTitle.value.trim()) return;
  await taskStore.createTask(newTitle.value, newDesc.value);
  showModal.value = false;
};

onMounted(() => {
    taskStore.fetchTasks();
});
</script>