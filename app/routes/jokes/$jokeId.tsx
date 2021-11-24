import { Link, redirect, useCatch, useLoaderData, useParams } from "remix";
import type { ActionFunction, LoaderFunction } from "remix";
import { Joke } from "@prisma/client";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

type LoaderData = { joke: Joke; isOwner: boolean };

export let action: ActionFunction = async ({ request, params }) => {
  let form = await request.formData();
  if (form.get("_method") === "delete") {
    let userId = await requireUserId(request);
    let joke = await db.joke.findUnique({
      where: { id: params.jokeId },
    });
    if (!joke) {
      throw new Response("Can't delete what does not exist", { status: 404 });
    }
    if (joke.jokesterId !== userId) {
      throw new Response("Pssh, nice try. That's not your joke", {
        status: 403,
      });
    }
    await db.joke.delete({ where: { id: params.jokeId } });
    return redirect("/jokes");
  }
};

export let loader: LoaderFunction = async ({ params, request }) => {
  let userId = await getUserId(request);
  let joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) throw new Response("What a joke! Not found.", { status: 404 });
  let data: LoaderData = { joke, isOwner: userId === joke.jokesterId };
  return data;
};

export default function JokeRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">"{data.joke.name}" Permalink</Link>
      {data.isOwner && (
        <form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="button">
            Delete
          </button>
        </form>
      )}
    </div>
  );
}

export function CatchBoundary() {
  let caught = useCatch();
  let params = useParams();

  switch (caught.status) {
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is "{params.jokeId}"?
        </div>
      );
    }
    case 403: {
      return (
        <div className="error-container">
          Sorry, but {params.jokeId} is not yours.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary() {
  let { jokeId } = useParams();
  return (
    <div className="error-container">
      There was an error loading joke by the id ${jokeId}. Sorry.
    </div>
  );
}
