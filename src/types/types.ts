import { RouterInputs } from "~/utils/api";

// tie the server input to our type
export type ChatMessage =
  RouterInputs["example"]["getCompletions"]["messages"][0];

// export interface ErrorMessage {
//   code: string;
//   message: string;
// }
