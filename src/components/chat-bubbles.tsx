export function AIChatBubble(props: { text: string }) {
  try {
    let js = JSON.parse(props.text);
    console.log(js);
  } catch (e) {}

  return (
    <div className="col-start-1 col-end-8 rounded-lg p-3">
      <div className="flex flex-row items-center">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-solid border-indigo-500 dark:bg-indigo-500">
          AI
        </div>
        <div className="relative ml-3 rounded-xl px-4 py-2 text-sm shadow">
          <div>{props.text}</div>
        </div>
      </div>
    </div>
  );
}

export function UserChatBubble(props: { text: string }) {
  return (
    <div className="col-start-6 col-end-13 rounded-lg p-3">
      <div className="flex flex-row-reverse items-center justify-start">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-solid border-indigo-800 dark:bg-indigo-800">
          Me
        </div>
        <div className="relative mr-3 rounded-xl px-4 py-2 text-sm shadow">
          <div>{props.text}</div>
        </div>
      </div>
    </div>
  );
}
