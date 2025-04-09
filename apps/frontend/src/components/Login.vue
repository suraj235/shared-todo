<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
        <h1 class="text-2xl font-bold mb-4">Login</h1>
        <form @submit.prevent="handleLogin" class="w-full max-w-sm">
            <input v-model="email" type="email" placeholder="Email" class="block w-full mb-3 p-2 border rounded"
                required />
            <input v-model="password" type="password" placeholder="Password"
                class="block w-full mb-3 p-2 border rounded" required />
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded">
                Login
            </button>
        </form>
        <p>Don't have an account? <router-link to="/signup" class="text-blue-500">Sign Up</router-link></p>
        <p class="text-red-500 mt-2" v-if="error">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);

        // Redirect after successful login
        router.push('/dashboard');
    } catch (err: any) {
        error.value = err.message || 'Login failed';
    }
};
</script>