import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function taskRoutes(fastify: FastifyInstance) {
    // Middleware auth check
    // fastify.addHook('onRequest', async (request, reply) => {
    //     const user = (request as any).user as { uid: string; email?: string };
    //     if (!user) {
    //         reply.code(401).send({ error: 'Unauthorized' });
    //     }
    // });

    // POST /tasks
    fastify.post('/tasks', async (request, reply) => {
        const { title, description } = request.body as {
            title: string;
            description?: string;
        };

        const user = (request as any).user as { uid: string; email?: string };
        const task = await prisma.task.create({
            data: {
                title,
                description,
                createdById: user.uid,
            },
        });

        return task;
    });

    // GET /tasks?filter=[all|my|shared]
    fastify.get('/tasks', async (request, reply) => {
        const user = (request as any).user as { id: string; email?: string };
        const filter = (request.query as { filter?: string }).filter || 'all';

        if (filter === 'my') {
            return prisma.task.findMany({
                where: { createdById: user.id },
            });
        }

        if (filter === 'shared') {
            return prisma.taskShare.findMany({
                where: { userId: user.id },
                include: { task: true },
            }).then(shares => shares.map(s => s.task));
        }

        const [ownTasks, shared] = await Promise.all([
            prisma.task.findMany({ where: { createdById: user.id } }),
            prisma.taskShare.findMany({
                where: { userId: user.id },
                include: { task: true },
            }),
        ]);

        const sharedTasks = shared.map(s => s.task);
        return [...ownTasks, ...sharedTasks];
    });

    // PUT /tasks/:id Update task only if owner
    fastify.put<{
        Params: { id: string }
      }>('/tasks/:id', async (request, reply) => {
        const user = (request as any).user as { uid: string; email?: string };
        const taskId = request.params['id'];
        const { title, description } = request.body as {
            title: string;
            description?: string;
        };

        // check ownership
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task || task.createdById !== user.uid) {
            return reply.code(403).send({ error: 'Forbidden' });
        }

        const updated = await prisma.task.update({
            where: { id: taskId },
            data: { title, description },
        });

        return updated;
    });

    // DELETE /tasks/:id - Delete task only if owner
    fastify.delete<{
        Params: { id: string }
      }>('/tasks/:id', async (request, reply) => {
        const user = (request as any).user as { uid: string; email?: string };
        const taskId = request.params['id'];

        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task || task.createdById !== user.uid) {
            return reply.code(403).send({ error: 'Forbidden' });
        }

        await prisma.task.delete({ where: { id: taskId } });
        return { success: true };
    });

    // POST /tasks/:id/share - Share task with another user by email
    fastify.post<{
        Params: { id: string }
      }>('/tasks/:id/share', async (request, reply) => {
        const user = (request as any).user as { uid: string; email?: string };
        const taskId = request.params['id'];
        const { email } = request.body as { email: string };

        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task || task.createdById !== user.uid) {
            return reply.code(403).send({ error: 'Forbidden' });
        }

        const targetUser = await prisma.user.findUnique({ where: { email } });
        if (!targetUser) {
            return reply.code(404).send({ error: 'User not found' });
        }

        // Share task
        await prisma.taskShare.create({
            data: {
                taskId,
                userId: targetUser.id,
            },
        });

        return { shared: true };
    });
}
