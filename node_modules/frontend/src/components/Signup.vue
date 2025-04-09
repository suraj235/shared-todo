<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
        <h1 class="text-2xl font-bold mb-4">Sign Up</h1>
        <form @submit.prevent="handleSignup" class="w-full max-w-sm">
            <input v-model="email" type="email" placeholder="Email" class="block w-full mb-3 p-2 border rounded"
                required />
            <input v-model="password" type="password" placeholder="Password"
                class="block w-full mb-3 p-2 border rounded" required />
            <button type="submit" class="w-full bg-green-600 text-white py-2 rounded">
                Sign Up
            </button>
        </form>
        <p class="text-red-500 mt-2" v-if="error">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleSignup = async () => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);
        router.push('/dashboard');
    } catch (err: any) {
        error.value = err.message || 'Signup failed';
    }
};
</script>