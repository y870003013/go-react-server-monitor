import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SciFiCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    neonColor?: 'cyan' | 'purple' | 'green' | 'red';
}

export const SciFiCard: React.FC<SciFiCardProps> = ({
    children,
    className,
    neonColor = 'cyan',
    ...props
}) => {
    const colorMap = {
        cyan: 'var(--color-sci-cyan)',
        purple: 'var(--color-sci-purple)',
        green: 'var(--color-sci-green)',
        red: '#ff003c'
    };

    const color = colorMap[neonColor];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative p-6 rounded-xl overflow-hidden glass-panel transition-all duration-300 group",
                className
            )}
            style={{
                borderColor: `rgba(255,255,255,0.1)`,
                boxShadow: `0 0 40px -10px ${color}10` // Subtle colored ambient glow
            }}
            {...props}
        >
            {/* Glass Highlight/Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-md" style={{ borderColor: color }} />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-md" style={{ borderColor: color }} />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-md" style={{ borderColor: color }} />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-md" style={{ borderColor: color }} />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Hover Glow Effect */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            />
        </motion.div>
    );
};
