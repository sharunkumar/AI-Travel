import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export function TextareaWithButton() {
  return (
    <div className="flex flex-row items-center gap-2">
      <Textarea placeholder="Type your message here." />
      <Button size={"lg"} className="grow">
        Send
      </Button>
    </div>
  );
}
