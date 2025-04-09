import { defineStore } from 'pinia';

export type Task = {
  id: string;
  title: string;
  description?: string;
  createdById: string;
  createdAt: string;
};

type Filter = 'all' | 'my' | 'shared';

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    filter: 'all' as Filter,
    loading: false,
  }),
  actions: {
    async fetchTasks() {
      this.loading = true;
      const token = localStorage.getItem('token');
      try {
        const BASE_URL = 'http://localhost:3000'
        const res = await fetch(`${BASE_URL}/api/tasks?filter=${this.filter}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        this.tasks = data;
      } catch (err) {
        console.error('Failed to load tasks', err);
      } finally {
        this.loading = false;
      }
    },
    setFilter(filter: Filter) {
      this.filter = filter;
      this.fetchTasks();
    },
    async createTask(title: string, description: string) {
      const token = localStorage.getItem('token');
      // console.log(token)
      try {
        const BASE_URL = 'http://localhost:3000'

        await fetch(`${BASE_URL}/api/tasks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description }),
        });
        this.fetchTasks(); // refresh after adding
      } catch (err) {
        console.error('Failed to create task', err);
      }
    },    
  },
});
