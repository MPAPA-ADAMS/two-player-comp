import SeasonSetupForm from "@/components/admin/SeasonSetupForm";

export default async function NewSeasonPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
        Admin
      </p>

      <h1 className="mt-3 text-4xl font-black">Set up a new season</h1>

      <p className="mt-3 text-zinc-400">
        Enter the games, mentors, and players participating in this season.
      </p>

      <div className="mt-10">
        <SeasonSetupForm />
      </div>
    </main>
  );
}
