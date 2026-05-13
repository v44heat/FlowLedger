  // ─── frontend/src/components/ui/Badge.tsx ─────────────────────────────────────
  import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/categories';
  
  interface BadgeProps {
    category: string;
    showIcon?: boolean;
    size?: 'sm' | 'md';
  }
  
  export const CategoryBadge = ({ category, showIcon = true, size = 'sm' }: BadgeProps) => {
    const color = CATEGORY_COLORS[category] || '#6b7280';
    const icon = CATEGORY_ICONS[category] || '❓';
    const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
    return (
      <span
        className={`inline-flex items-center gap-1 ${pad} rounded-full font-medium`}
        style={{ background: `${color}20`, color }}
      >
        {showIcon && <span>{icon}</span>}
        {category}
      </span>
    );
  };
  
  
