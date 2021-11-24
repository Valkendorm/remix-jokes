import { Link, Outlet, useCatch, useLoaderData } from "remix";
import type { LinksFunction, LoaderFunction } from "remix";
import type { Joke, User } from "@prisma/client";
import { db } from "~/utils/db.server";
import stylesUrl from "~/styles/jokes.css";
import { getUser } from "~/utils/session.server";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

type LoaderData = {
  user: User | null;
  jokeListItems: Array<Pick<Joke, "id" | "name">>;
};

export let loader: LoaderFunction = async ({ request }) => {
  let user = await getUser(request);
  let jokeListItems = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
  let data: LoaderData = {
    jokeListItems,
    user,
  };
  return data;
};

export default function JokesRoute() {
  let data = useLoaderData<LoaderData>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            {Boolean(data.jokeListItems.length) && (
              <>
                <Link to=".">Get a random joke</Link>
                <p>Here are a few more jokes to check out:</p>
                <ul>
                  {data.jokeListItems.map((joke) => (
                    <li key={joke.id}>
                      <Link to={joke.id}>{joke.name}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="jokes-footer">
        <div className="container">
          <Link to="/jokes.rss" reloadDocument>
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}

// Has to be there even though it does nothing
// Otherwise, it ends up as a server error when trying to delete a joke and
// the user is not logged in or the joke is from another user.
// Reported error: Cannot read property 'user' of undefined
export function CatchBoundary() {}
