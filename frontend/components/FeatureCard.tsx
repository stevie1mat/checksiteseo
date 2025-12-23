import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <Card className="bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group rounded-2xl">
            <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-500 leading-relaxed text-sm">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
