import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import { env } from "~/env.mjs";
import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const gptRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  createCollab: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.collaboration.upsert({
      where: {
        userId: ctx.session.user.id,
      },
      create: {
        userId: ctx.session.user.id,
      },
      update: {},
    });
  }),

  cancelCollab: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.collaboration.delete({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  getCollab: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.collaboration.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        id: true,
      },
    });
  }),

  getCollabById: publicProcedure
    .input(
      z.object({
        collabId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.collaboration.findFirst({
        where: {
          id: input.collabId,
        },
        select: {
          host: true,
          id: true,
        },
      });
    }),

  getChatsInCollab: publicProcedure
    .input(
      z.object({
        collabId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      let sesh = await ctx.prisma.collaboration.findFirstOrThrow({
        where: {
          id: input.collabId,
        },
        select: {
          userId: true,
        },
      });

      return await ctx.prisma.chatMessage.findMany({
        select: {
          role: true,
          content: true,
          fromCollab: true,
        },
        where: {
          userId: sesh.userId,
        },
      });
    }),

  sendInput: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.chatMessage.create({
        data: {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: input,
          userId: ctx.session.user.id,
        },
      });

      await getOpenAiCompletion(ctx.prisma, ctx.session.user.id);
    }),

  sendInputToCollab: publicProcedure
    .input(
      z.object({
        collabId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sesh = await ctx.prisma.collaboration.findFirstOrThrow({
        where: {
          id: input.collabId,
        },
        select: {
          host: true,
        },
      });
      await ctx.prisma.chatMessage.create({
        data: {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: input.content,
          userId: sesh.host.id,
        },
      });
      await getOpenAiCompletion(ctx.prisma, sesh.host.id);
    }),

  clearChats: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.chatMessage.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  setSystemRole: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.systemRole.upsert({
        where: {
          id: 0,
        },
        create: {
          content: input,
        },
        update: {
          content: input,
        },
        select: {
          role: true,
          content: true,
        },
      });
    }),

  getChats: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.chatMessage.findMany({
      select: {
        role: true,
        content: true,
        fromCollab: true,
      },
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});

// function isRole(value: string): value is ChatCompletionRequestMessageRoleEnum {
//   return Object.values<string>(ChatCompletionRequestMessageRoleEnum).includes(
//     value
//   );
// }

async function getOpenAiCompletion(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  userId: string
) {
  const sys = await prisma.systemRole.findFirst({
    select: { role: true, content: true },
  });

  let msgs = [] as ChatCompletionRequestMessage[];

  if (sys) msgs.push(sys as ChatCompletionRequestMessage);

  let user_messages = await prisma.chatMessage.findMany({
    select: {
      role: true,
      content: true,
    },
    where: {
      userId,
    },
  });

  let user_messages_2 = user_messages.map((m) => {
    return {
      role: m.role as ChatCompletionRequestMessageRoleEnum,
      content: m.content,
    } as ChatCompletionRequestMessage;
  });

  const chatCompletion = await openai.createChatCompletion({
    model: env.OPENAI_API_MODEL,
    messages: [sys as ChatCompletionRequestMessage, ...user_messages_2],
    stream: false,
  });

  let ai_msg = chatCompletion.data.choices[0]?.message;

  if (!ai_msg) return;

  await prisma.chatMessage.create({
    data: {
      role: ai_msg.role,
      content: ai_msg.content!,
      userId,
    },
  });

  // prisma.chatMessage.create({
  //   data: {
  //     role: chatCompletion.data.choices[0]?.message?.role,
  //     content: chatCompletion.data.choices[0]?.message?.role || "",
  //   },
  // });
}
