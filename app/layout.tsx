import DynamicNavbar from "@/components/NavbarDynamic";
import { Toaster } from "@/components/Toasts/toaster";
import { getURL } from "@/utils/helpers";
import type { Metadata } from "next";
import { type PropsWithChildren, Suspense } from "react";
import "./main.css";

const title = "RTHMN | Next Generation Forex / Stocks Toolkit";
const description = "RTHMN is a next generation algorithmic trading platform that provides real-time trading signals, 3D pattern recognition, gamified learning, AI-powered predictions, and comprehensive risk management.";

const clarityTrackingCode = process.env.NEXT_PUBLIC_CLARITY_TRACKING_CODE;
const gtagId = process.env.NEXT_PUBLIC_GTAG_ID;

export const metadata: Metadata = {
	metadataBase: new URL(getURL()),
	title: title,
	description: description,
	openGraph: {
		title: title,
		description: description,
	},
};

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<body className="bg-black">
					<DynamicNavbar />
					<main className="md:min-h[calc(100dvh-5rem)] min-h-[calc(100dvh-4rem)]"
					>
						{children}
					</main>
					<Suspense>
						<Toaster />
					</Suspense>
				{/* {clarityTrackingCode && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityTrackingCode}");
            `}
          </Script>
        )}
        {gtagId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${gtagId}');
              `}
            </Script>
          </>
        )} */}
			</body>
		</html>
	);
}
