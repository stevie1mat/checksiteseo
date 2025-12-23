interface StepCardProps {
    number: string;
    title: string;
    description: string;
}

export function StepCard({ number, title, description }: StepCardProps) {
    return (
        <div className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-white border border-gray-100 hover:border-pink-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                {number}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">{description}</p>
        </div>
    )
}
