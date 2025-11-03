import Header from "@/components/header/header";
import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";

const poppinsFont = Poppins({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-poppins',
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    title: "Страница не найдена",
    description: "Ошибка 404 — страница отсутствует",
};

export default function NotFound() {
    return (
        <html lang="ru">
            <body className={`${poppinsFont.variable}`}>
                <Header />
                <main className="main" style={{ textAlign: "center" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: 700, marginTop: "40px" }}>
                        404
                    </h1>

                    <p style={{ marginBottom: "24px", fontSize: "18px" }}>
                        Такой страницы не существует
                    </p>

                    <div
                        style={{
                            width: "100%",
                            maxWidth: "240px",
                            margin: "0 auto 32px",
                            animation: "float 2.5s ease-in-out infinite",
                        }}
                    >
                        <svg
                            width="100%"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="100" cy="100" r="80" fill="var(--primary)" opacity="0.1" />
                            <path
                                d="M60 120C60 95 80 80 100 80C120 80 140 95 140 120"
                                stroke="var(--primary)"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                            <circle cx="80" cy="95" r="6" fill="var(--primary)" />
                            <circle cx="120" cy="95" r="6" fill="var(--primary)" />
                        </svg>
                    </div>

                    <Link
                        href="/"
                        style={{
                            display: "inline-block",
                            padding: "12px 20px",
                            borderRadius: "6px",
                            background: "var(--primary)",
                            color: "var(--inversed-font)",
                            textDecoration: "none",
                            fontSize: "14px",
                            fontWeight: 500,
                        }}
                    >
                        На главную
                    </Link>

                    <style>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
          `}</style>
                </main>
            </body>
        </html>
    );
}
