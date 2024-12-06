"use client";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            className="flex items-center justify-center h-screen"
            style={{
                background: `
                    linear-gradient(135deg,
                        rgba(75, 35, 35, 0.97),
                        rgba(120, 45, 45, 0.95)
                    ),
                    repeating-linear-gradient(
                        45deg,
                        rgba(42, 21, 21, 0.15) 0px,
                        rgba(42, 21, 21, 0.15) 1px,
                        transparent 1px,
                        transparent 20px
                    ),
                    repeating-linear-gradient(
                        -45deg,
                        rgba(42, 21, 21, 0.15) 0px,
                        rgba(42, 21, 21, 0.15) 1px,
                        transparent 1px,
                        transparent 20px
                    )`,
                backgroundBlendMode: 'overlay',
                width: '100%',
                height: '100%'
            }}
        >
            {children}
        </div>
    );
};

<style jsx>{`
  /* empty */
`}</style>

export default AuthLayout;