export const dynamic = "force-dynamic";

export default function Home() {
  const snippet = {
    title: "Binary Tree Level Order Traversal",
    language: "python",
    pattern: "BFS",
    code: `from collections import deque

def level_order(root):
    if not root:
        return []

    queue = deque([root])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node.val)

        if node.left:
            queue.append(node.left)

        if node.right:
            queue.append(node.right)

    return result`,
  };

  return (
    <main className="px-4 py-2">
      {/* Header */}
      <div className="flex items-start justify-between ">
        <div>
          <h1 className="text-3xl font-bold">{snippet.title}</h1>

          <p className="mt-1 text-muted-foreground">
            {snippet.pattern}
          </p>
        </div>

      </div>

      {/* Code */}
      <div className=" flex justify-center">
      <pre className="mt-6 whitespace-pre-wrap font-mono text-xl leading-9 text-muted-foreground">
        <code>{snippet.code}</code>
      </pre>
      </div>
    </main>
  );
}