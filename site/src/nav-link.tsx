export const NavLink = (props) => {
  return (
    <a
      class="inline-block no-underline hover:underline py-2 px-4"
      href={props.href}
      onClick={props.onClick}
    >
      {props.children}
    </a>
  );
};
