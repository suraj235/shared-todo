import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { taskRoutes } from './routes/tasks-endpoints';
import firebaseAuthPlugin from './plugins/firebase-auth';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

const start = async () => {
  try {
    await fastify.register(cors, {
      origin: 'http://localhost:5173',
      credentials: true,
    });

    await fastify.register(firebaseAuthPlugin);
    await fastify.register(taskRoutes, { prefix: '/api' });

    fastify.get('/health', async () => {
      return { status: 'OK' };
    });

    fastify.get('/users', async () => {
      return await prisma.user.findMany();
    });

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server listening on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
