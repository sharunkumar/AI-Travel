import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getCompletions: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .query(({ input }) => {
      return input.messages;
    }),

  getCompletion: publicProcedure.input(z.string()).query(({ input, ctx }) => {
    ctx.prisma.chatMessage.create({
      data: {
        role: "user",
        content: input,
      },
    });

    return ctx.prisma.chatMessage.findMany();
  }),

  setSystemRole: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.systemRole.upsert({
        where: {
          id: 0,
        },
        create: {
          prompt: input,
        },
        update: {
          prompt: input,
        },
        select: {
          role: true,
          prompt: true,
        },
      });
    }),
});
