import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Typing Practice",
    description:
      "Practice typing real code snippets and improve your speed and accuracy.",
    href: "/typing",
    image: "/Screenshot 2026-07-23 232035.png",
  },
  {
    title: "Pattern Recognition",
    description:
      "Understand problems and the patterns associated with them.",
    href: "/testing",
    image: "/public",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl">
        <section className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Software Practice
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            The place to practice and warm up for LeetCode.
          </p>

          <div className="mt-12 grid w-full gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group overflow-hidden rounded-xl border border-border bg-card text-left transition hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-muted">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>

                  <span className="mt-5 inline-flex items-center text-sm font-medium">
                    Open feature
                    <span
                      aria-hidden="true"
                      className="ml-2 transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
