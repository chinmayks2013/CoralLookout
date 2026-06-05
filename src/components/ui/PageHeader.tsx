interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
}

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="text-center mb-8 sm:mb-12 px-1">
      {badge && (
        <span className="inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-[11px] sm:text-xs font-semibold text-cyan-300 mb-3 sm:mb-4">
          {badge}
        </span>
      )}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 gradient-text text-balance">
        {title}
      </h1>
      <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-pretty px-2">
        {subtitle}
      </p>
    </div>
  );
}
