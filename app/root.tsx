import { Links, LiveReload, Meta, Outlet, Scripts, useCatch } from "remix";
import type { LinksFunction, MetaFunction } from "remix";
import globalStylesUrl from "~/styles/global.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalLargeStylesUrl from "~/styles/global-large.css";

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
    {
      rel: "stylesheet",
      href: globalMediumStylesUrl,
      media: "print, (min-width: 640px)",
    },
    {
      rel: "stylesheet",
      href: globalLargeStylesUrl,
      media: "screen and (min-width: 1024px)",
    },
  ];
};

export let meta: MetaFunction = () => {
  let description = `Learn Remix and laugh at the same time!`;
  return {
    description,
    keywords: "Remix,jokes",
    "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": "Remix Jokes",
    "twitter:description": description,
  };
};

type DocumentProps = {
  children: React.ReactNode;
  title?: string;
};

function Document({
  children,
  title = `Remix: So great, it's funny!`,
}: DocumentProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        {/* 
          Somehow, having the <title> element before <Meta> will indeed update the element's value, 
          but will still display the original value in the browser. However, by inverting the elements
          order, a 2nd <title> element will be rendered, but the browser will show the correct value. 
        */}
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        {/* Browser reports: "Warning: Did not expect server HTML to contain a <script> in <html>." */}
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

// Client Errors reporting
export function CatchBoundary() {
  let caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div className="error-container">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

// Server Errors reporting
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </div>
    </Document>
  );
}
