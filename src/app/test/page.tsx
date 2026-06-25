import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function TestPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const posts = await api.post.getAll();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-border/80 bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="font-sans text-lg font-semibold tracking-tight text-ink"
          >
            WitStartup
            <span className="text-primary">Pitch</span>
          </Link>
          <div className="flex items-center gap-4 font-sans text-sm">
            <span className="text-muted">
              {session.user.name ?? session.user.email}
            </span>
            <Link
              href="/"
              className="text-muted transition-colors hover:text-ink"
            >
              Home
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-border px-4 py-2 font-semibold transition-colors hover:bg-surface"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="font-sans text-sm font-medium text-primary">
              Authenticated workspace
            </p>
            <h1 className="font-sans text-3xl font-semibold tracking-tight">
              Database test
            </h1>
            <p className="text-muted">
              Rows from{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-ink">
                witstartuppitch_post
              </code>
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-border bg-surface px-5 py-3">
            <p className="text-[11px] uppercase tracking-widest text-muted">
              Signed in
            </p>
            <p className="mt-0.5 font-sans text-sm font-medium text-ink">
              {session.user.name ?? session.user.email}
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
            <p className="font-sans text-base font-medium text-ink">
              No rows in witstartuppitch_post yet.
            </p>
            <p className="mt-1 text-sm text-muted">
              Seed data from your backend to see it appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[1.25rem] border border-border">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Created by</th>
                  <th className="px-4 py-3 font-semibold">Created at</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface/70"
                  >
                    <td className="px-4 py-3 tabular-nums">{post.id}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {post.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {post.createdById}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">
                      {post.createdAt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
