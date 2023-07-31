import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { AIChatBubble, UserChatBubble } from "~/components/chat-bubbles";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/utils/api";
import { useEffect, useRef, useState } from "react";

// const useMountEffect = (fun: any) => useEffect(fun, []);

export default function Home() {
  // const myRef = useRef(null);

  // const executeScroll = () => myRef.current.scrollIntoView(); // run this function from an event handler or pass it to useEffect to execute scroll

  // useMountEffect(executeScroll); // Scroll on mount

  const { data: sessionData } = useSession();

  const { data: system_message } = api.gpt.setSystemRole.useQuery(
    `
    Imagine you are a seasoned travel advisor responsible for assisting globetrotters in planning their dream vacations. Your mission is to provide expert travel advice and itinerary recommendations tailored to their preferences and interests. Write a comprehensive travel guide covering must-visit destinations, local attractions, hidden gems, transportation options, budget tips, safety precautions, and cultural insights to ensure a memorable and enriching travel experience for your clients.
    Please structure your response in a well-formatted JSON format, ensuring it provides logical and coherent information to facilitate easy consumption and integration into travel planning applications.
    `.trim()
  );

  const { data: messages, refetch: refetch_chats } =
    api.gpt.getChats.useQuery();

  const completion = api.gpt.getCompletion.useMutation();

  const [text, setText] = useState("");

  console.log({ messages });

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
            <ModeToggle />
          </div>
        </nav>
        <div className="grow gap-10 overflow-y-auto px-96">
          <div style={{ display: "none" }}>{system_message?.prompt}</div>
          {messages?.map((msg, idx) => {
            switch (msg.role) {
              case "user":
                return <UserChatBubble key={idx} text={msg.content} />;
              case "assistant":
                return <AIChatBubble key={idx} text={msg.content} />;
            }

            return <></>;
          })}
          {/* <hr ref={myRef} /> */}
        </div>
        <div className="container p-8">
          <div className="flex flex-row items-center gap-2">
            <Textarea
              placeholder="Type your message here."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              size={"lg"}
              className="grow"
              disabled={text.trim() == ""}
              onClick={(e) => {
                e.preventDefault();
                completion.mutate(text, {
                  onSuccess: async () => {
                    refetch_chats();
                    // executeScroll();
                  },
                });
              }}
            >
              Send
            </Button>
            <Button
              size={"lg"}
              variant={"destructive"}
              className="grow"
              disabled={text.trim() == ""}
              onClick={(e) => {
                e.preventDefault();
                completion.mutate(text, {
                  onSuccess: async () => {
                    refetch_chats();
                  },
                });
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
