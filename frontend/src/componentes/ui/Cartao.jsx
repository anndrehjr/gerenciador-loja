export default function Cartao({ as: Tag = "div", padding = "p-6", className = "", children, ...props }) {
  return (
    <Tag className={`rounded-2xl border border-line bg-surface ${padding} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
