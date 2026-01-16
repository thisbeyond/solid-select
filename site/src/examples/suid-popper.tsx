import { Placement, autoUpdate, computePosition, flip } from "@floating-ui/dom";
import { Box, useTheme } from "@suid/material";
import { BoxProps } from "@suid/material/Box/BoxProps";
import createElementRef from "@suid/system/createElementRef";
import { ParentComponent, Show, createEffect, on, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

type PopperProps = {
  open: boolean;
  anchorEl: HTMLElement;
  placement?: Placement;
} & BoxProps;

export const Popper: ParentComponent<PopperProps> = (props) => {
  const [local, passthrough] = splitProps(props, [
    "open",
    "anchorEl",
    "placement",
    "children",
  ]);
  const theme = useTheme();
  const popperRef = createElementRef();
  let cleanup: () => void | undefined;

  const updatePosition = async () => {
    if (local.anchorEl && popperRef.ref) {
      const position = await computePosition(local.anchorEl, popperRef.ref, {
        placement: local.placement,
        middleware: [flip()],
      });
      Object.assign(popperRef.ref.style, {
        top: `${position.y}px`,
        left: `${position.x}px`,
      });
    }
  };

  createEffect(
    on(
      () => local.open,
      (open) => {
        if (open) {
          cleanup = autoUpdate(local.anchorEl, popperRef.ref, updatePosition);
        } else {
          if (cleanup) cleanup();
        }
      }
    )
  );

  return (
    <Show when={local.open}>
      <Portal>
        <Box
          ref={popperRef}
          position="absolute"
          top={0}
          left={0}
          zIndex={theme.zIndex.tooltip}
          {...passthrough}
        >
          {local.children}
        </Box>
      </Portal>
    </Show>
  );
};
