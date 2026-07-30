export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
        N
      </div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Welcome to NextShowcase
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Select a module from the sidebar to get started.
      </p>
    </div>
  );
}
