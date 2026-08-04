export default function DevelopersNotes() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Developer&apos;s Notes</h1>

      <div className="space-y-6 leading-8 text-muted-foreground">
        <p>
          Hey, I am the developer of this app! I want to use this page to share
          some insights.
        </p>

        <p>
          First, this project is a work in progress and a <strong>tool to practice
          before studying leetcode</strong>. The goal is not to contend with services as
          leetcode, neetcode, etc. but rather to warm-up before using these
          websites. The typing test provides classic DSA patterns that through
          muscle memory should become second nature. 
        </p>
        <p>
          Second, I am not a front-end developer nor is it my specialty. I can
          get by, but the feel and look of the website needs improvement. I will
          try my best to make it look as good as I can make it.
        </p>

        <p>
          Finally, this website was created for fun and to help me prepare 
          for software engineering interviews. Hopefully, this helps others prep too! 
        </p>
        <p className="pt-8 text-sm text-muted-foreground">— July 29, 2026</p>
      </div>
    </main>
  );
}
