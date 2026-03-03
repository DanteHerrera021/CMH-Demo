export default function Button({
  text,
  className = "",
  isRounded = "",
  ...props
}) {
  return (
    <button
      className={`
        px-4 py-2 font-medium transition
        ${isRounded != "sm" ? "rounded-full" : "rounded-md"}
        ${className}
      `}
      {...props}
    >
      {text}
    </button>
  );
}
