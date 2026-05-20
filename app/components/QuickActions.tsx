interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="max-w-6xl mx-auto px-2 md:px-0">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wider md:tracking-widest mb-2 md:mb-4">快捷入口</h2>
        <p className="text-white/50 text-sm md:text-base">一键直达您关心的功能</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className="group p-4 md:p-6 border border-white/10 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">{action.label}</h3>
            <p className="text-xs text-white/50 hidden sm:block">{action.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
