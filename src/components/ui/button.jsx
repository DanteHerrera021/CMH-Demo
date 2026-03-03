export default function Button({
  text,
  isRounded,
  textColor,
  backgroundColor
}) {
  return (
    <button
      className={`${isRounded ? "rounded-full" : "rounded-md"} px-4 py-2 focus:outline-none`}
      style={{ color: textColor, backgroundColor: backgroundColor }}
    >
      {text}
    </button>
  );
}
