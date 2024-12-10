"use client";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-300 to-amber-600 dark:from-zinc-900 dark:via-amber-900 dark:to-amber-800 opacity-20" />
                
                {/* Mesh gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(245,158,11,0.3),transparent_60%)]" />
                
                {/* Diagonal lines pattern */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
                            repeating-linear-gradient(
                                45deg,
                                rgba(245, 158, 11, 0.1) 0px,
                                rgba(245, 158, 11, 0.1) 1px,
                                transparent 1px,
                                transparent 20px
                            ),
                            repeating-linear-gradient(
                                -45deg,
                                rgba(245, 158, 11, 0.1) 0px,
                                rgba(245, 158, 11, 0.1) 1px,
                                transparent 1px,
                                transparent 20px
                            )
                        `
                    }}
                />

                {/* Subtle pattern */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
                            linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px),
                            linear-gradient(0deg, rgba(245,158,11,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/30 dark:bg-amber-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/20 dark:bg-amber-700/20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
}

export default AuthLayout;