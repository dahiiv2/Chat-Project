"use client";

import { cn } from "@/lib/utils";

interface ModalWrapperProps {
    children: React.ReactNode;
}

export const ModalWrapper = ({
    children
}: ModalWrapperProps) => {
    return (
        <div className={cn("relative font-sans antialiased")}>
            <div
                className="fixed inset-0"
                style={{
                    background: `
                        linear-gradient(135deg,
                            rgba(184, 134, 11, 0.97),
                            rgba(218, 165, 32, 0.95)
                        ),
                        repeating-linear-gradient(
                            45deg,
                            rgba(218, 165, 32, 0.15) 0px,
                            rgba(218, 165, 32, 0.15) 1px,
                            transparent 1px,
                            transparent 20px
                        ),
                        repeating-linear-gradient(
                            -45deg,
                            rgba(184, 134, 11, 0.15) 0px,
                            rgba(184, 134, 11, 0.15) 1px,
                            transparent 1px,
                            transparent 20px
                        )`,
                    backgroundBlendMode: 'overlay',
                }}
            />
            <div className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
