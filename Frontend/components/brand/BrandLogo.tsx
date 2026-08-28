import type { Business } from "@/types/models";

export function BrandLogo({ business, compact = false }: { business: Business; compact?: boolean }) {
  return (
    <div className={`brand-logo ${compact ? "brand-logo--compact" : ""}`}>
      {business.logoUrl ? <img src={business.logoUrl} alt={`${business.name}, ${business.subBrand}`} /> : (
        <span className="brand-logo__text" aria-label={`${business.name}, ${business.subBrand}`}>
          <strong>{business.name}</strong>
          <small>{business.subBrand}</small>
        </span>
      )}
    </div>
  );
}
