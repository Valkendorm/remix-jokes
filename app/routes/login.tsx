import type { ActionFunction, LinksFunction } from "remix";
import { Link, redirect, useActionData, useSearchParams } from "remix";
import bcrypt from "bcrypt";
import { db } from "~/utils/db.server";
import stylesUrl from "../styles/login.css";
import { createUserSession, login, register } from "~/utils/session.server";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string;
    username: string;
    password: string;
  };
};

export let action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  let formData = await request.formData();
  let loginType = formData.get("loginType");
  let username = formData.get("username");
  let password = formData.get("password");
  let redirectTo = formData.get("redirectTo");

  if (
    typeof loginType !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return { formError: "Form not submitted correctly." };
  }

  let fields = { loginType, username, password };
  let fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, fields };
  }

  switch (loginType) {
    case "login": {
      let user = await login({ username, password });

      if (!user) {
        return {
          fields,
          formError: "Invalid username or password.",
        };
      }

      return createUserSession(user.id, redirectTo);
    }
    case "register": {
      let userExists = await db.user.findFirst({ where: { username } });
      if (userExists) {
        return {
          fields,
          formError: `User with username ${username} already exists`,
        };
      }
      let user = await register({ username, password });
      if (!user) {
        return {
          fields,
          formError: "Something went wrong trying to create a new user.",
        };
      }
      return createUserSession(user.id, redirectTo);
    }
    default: {
      return { fields, formError: "Login type invalid" };
    }
  }
};

export default function LoginRoute() {
  let actionData = useActionData<ActionData | undefined>();
  let [searchParams] = useSearchParams();

  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form
          method="post"
          aria-describedby={
            actionData?.formError ? "form-error-message" : undefined
          }
        >
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? "/jokes"}
          />
          <fieldset>
            <legend className="sr-only">Login or Register?</legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={actionData?.fields?.loginType === "register"}
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.username) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.password ? "username-error" : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              type="password"
              id="password-input"
              name="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.password) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.password ? "password-error" : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p className="form-validation-error" role="alert">
                {actionData?.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}