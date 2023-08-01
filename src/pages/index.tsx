import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { AIChatBubble, UserChatBubble } from "~/components/chat-bubbles";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/utils/api";
import { useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";

export default function Home() {
  const { data: sessionData } = useSession();

  const { data: system_message } = api.gpt.setSystemRole.useQuery(
    `
    Imagine you are a seasoned travel advisor responsible for assisting globetrotters in planning their dream vacations. Your mission is to provide expert travel advice and itinerary recommendations tailored to their preferences and interests. Create a comprehensive travel guide in Markdown format that makes sense, presenting the information in a structured list with headings, subheadings, and bullet points. Your guide should cover must-visit destinations, local attractions, hidden gems, transportation options, budget tips, safety precautions, and cultural insights to ensure a memorable and enriching travel experience for your clients.
    Keep the sentences in the points laconic
    NEVER repeat locations in the itinerary!
    `.trim()
  );

  const { data: messages, refetch: refetch_chats } =
    api.gpt.getChats.useQuery();

  const completion = api.gpt.sendInput.useMutation();

  const clearChats = api.gpt.clearChats.useMutation();

  const [text, setText] = useState("");

  const [thinking, setThinking] = useState(false);

  const { data: collab, refetch: refetch_colab } = api.gpt.getCollab.useQuery();

  const createCollab = api.gpt.createCollab.useMutation();

  const cancelCollab = api.gpt.cancelCollab.useMutation();

  function newCollab() {
    createCollab.mutate(undefined, { onSuccess: () => refetch_colab() });
  }

  function deleteCollab() {
    cancelCollab.mutate(undefined, { onSuccess: () => refetch_colab() });
  }

  return (
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
              {sessionData && (
                <span>Logged in as {sessionData.user?.name}</span>
              )}
            </p>
            <Button
              size={"sm"}
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData ? "Sign out" : "Sign in"}
            </Button>
            {sessionData &&
              (collab ? (
                <Button variant={"secondary"} onClick={() => deleteCollab()}>
                  Cancel Session
                </Button>
              ) : (
                <Button variant={"secondary"} onClick={() => newCollab()}>
                  Invite someone
                </Button>
              ))}
            <ModeToggle />
          </div>
        </nav>
        {sessionData ? (
          <>
            <div className="grow gap-10 overflow-y-auto px-96">
              {messages?.map((msg, idx) => {
                switch (msg.role) {
                  case "user":
                    return (
                      <UserChatBubble
                        key={idx}
                        text={msg.content}
                        message_from={msg.fromCollab ? "collab" : "me"}
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
                      fromCollab: false,
                    });
                    setText("");
                    completion.mutate(text, {
                      onSuccess: async () => {
                        refetch_chats();
                        setThinking(false);
                      },
                    });
                  }}
                >
                  {thinking && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {thinking ? "Sending" : "Send"}
                </Button>
                <Button
                  size={"lg"}
                  variant={"destructive"}
                  className={`${
                    !thinking && messages?.length! > 0 ? "" : "hidden"
                  } grow`}
                  disabled={messages?.length == 0}
                  onClick={(e) => {
                    e.preventDefault();
                    clearChats.mutate(undefined, {
                      onSuccess: () => {
                        refetch_chats();
                      },
                    });
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex grow items-center justify-center align-middle text-4xl">
            <Button
              variant="ghost"
              size={"lg"}
              className="text-lg"
              onClick={() => signIn()}
            >
              Please log in to continue
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
