import 'fastify';
console.log('fastify.d.ts loaded');
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      uid: string;
      email?: string;
    };
  }
}
