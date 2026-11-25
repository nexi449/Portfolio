import BrandIcon, { type Brand } from "./brand-icon";

export default function IconLink({
  brand,
  href,
  label,
}: {
  brand: Brand;
  href: string;
  label: string;
}) {
  return (
    <a
      aria-label={label}
      className="icon-link"
      data-brand={brand}
      href={href}
      rel="noreferrer"
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      title={label}
    >
      <BrandIcon brand={brand} />
    </a>
  );
}
