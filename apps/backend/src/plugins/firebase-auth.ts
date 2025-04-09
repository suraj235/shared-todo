import { FastifyPluginAsync } from 'fastify';
import * as admin from 'firebase-admin';
import fs from 'fs';
import { FastifyRequest } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
    user: {
        uid: string;
        email?: string;
    };
}

const firebaseAuthPlugin: FastifyPluginAsync = async (fastify) => {
    // Initialize Firebase Admin only once
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }

    // Verify token in every request
    fastify.addHook('onRequest', async (request, reply) => {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({ message: 'Missing or invalid Authorization header' });
        }

        const idToken = authHeader.split(' ')[1];

        try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            (request as AuthenticatedRequest).user = {
                uid: decoded.uid,
                email: decoded.email,
            };
        } catch (err) {
            console.error('Token verification failed', err);
            return reply.code(401).send({ message: 'Invalid token' });
        }
    });
};

export default firebaseAuthPlugin;
