export default function Button({
  text,
  className = "",
  isRounded = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`
        px-4 py-2 font-medium transition
        ${isRounded != "sm" ? "rounded-full" : "rounded-md"}
        ${className}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      disabled={disabled}
      {...props}
    >
      {text}
    </button>
  );
}
