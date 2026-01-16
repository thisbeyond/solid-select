import { Show, createSignal } from "solid-js";
import CheckIcon from "@suid/icons-material/Check";
import ContentCopyIcon from "@suid/icons-material/ContentCopy";
import { Box } from "@suid/material";

export const InstallButton = () => {
  const code = "npm install @thisbeyond/solid-select";
  const [copied, setCopied] = createSignal(false);

  return (
    <button
      class={
        "mx-auto lg:mx-0 bg-white text-gray-800 " +
        "font-bold rounded-lg my-6 py-4 px-8 shadow-lg " +
        "focus:outline-none focus:shadow-outline transform transition " +
        "hover:scale-105 duration-300 ease-in-out font-mono " +
        "active:scale-100 "
      }
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
      }}
    >
      {code}
      <Box ml={1} component="span">
        <Show when={copied()} fallback={<ContentCopyIcon />}>
          <CheckIcon />
        </Show>
      </Box>
    </button>
  );
};
