import { RouterInputs, RouterOutputs } from "~/utils/api";

// tie the server input to our types
export type ChatMessage =
  RouterInputs["example"]["getCompletions"]["messages"][0];

export type SystemRole = RouterOutputs["example"]["setSystemRole"];

// export interface ErrorMessage {
//   code: string;
//   message: string;
// }
