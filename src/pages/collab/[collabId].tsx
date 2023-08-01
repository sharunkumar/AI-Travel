import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { AIChatBubble, UserChatBubble } from "~/components/chat-bubbles";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/utils/api";
import { useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";

export default function CollabPage() {
  const router = useRouter();

  const collabId = router.query.collabId as string;

  console.log({ collabId });

  const { data: sesh } = api.gpt.getCollabById.useQuery({
    collabId: collabId,
  });

  const { data: messages, refetch: refetch_chats } =
    api.gpt.getChatsInCollab.useQuery({ collabId: collabId });

  const completion = api.gpt.sendInputToCollab.useMutation();

  const [text, setText] = useState("");

  const [thinking, setThinking] = useState(false);

  // return <></>;

  return sesh ? (
    <>
      <Head>
        <title>AI Travel</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex max-h-screen min-h-screen w-full flex-col overflow-x-hidden overflow-y-hidden">
        <nav className="">
          <div className="flex flex-row items-center justify-center gap-4 p-4">
            <div className="grow">
              <h1 className="text-5xl font-extrabold tracking-tight">
                <span className="text-[hsl(280,100%,70%)]">AI</span> Travel
              </h1>
            </div>
            <p className="leading-7">
              <span>Connected to {sesh?.host.name}</span>
            </p>
            <ModeToggle />
          </div>
        </nav>
        <>
          <div className="grow gap-10 overflow-y-auto px-96">
            {messages?.map((msg, idx) => {
              switch (msg.role) {
                case "user":
                  return (
                    <UserChatBubble
                      key={idx}
                      text={msg.content}
                      message_from={msg.fromCollab ? "me" : "host"}
                    />
                  );
                case "assistant":
                  return <AIChatBubble key={idx} text={msg.content} />;
              }

              return <></>;
            })}
          </div>
          <div className="container p-8">
            <div className="flex flex-row items-center gap-2">
              <Textarea
                placeholder={"Type your message here."}
                disabled={thinking}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button
                size={"lg"}
                className="grow"
                disabled={thinking || text.trim() == ""}
                onClick={(e) => {
                  e.preventDefault();
                  setThinking(true);
                  messages?.push({
                    role: "user",
                    content: text,
                    fromCollab: true,
                  });
                  setText("");
                  completion.mutate(
                    {
                      collabId,
                      content: text,
                    },
                    {
                      onSuccess: async () => {
                        refetch_chats();
                        setThinking(false);
                      },
                    }
                  );
                }}
              >
                {thinking && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {thinking ? "Thinking" : "Send"}
              </Button>
            </div>
          </div>
        </>
      </main>
    </>
  ) : (
    <div className="flex min-h-screen grow items-center justify-center align-middle text-4xl">
      Session not found / cancelled
    </div>
  );
}
