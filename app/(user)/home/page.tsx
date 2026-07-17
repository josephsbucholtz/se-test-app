export const dynamic = "force-dynamic";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <main className="px-4 py-12">
      {/* Header */}
      <div className="flex items-start justify-between ">
        <div>
          <h1 className="text-3xl font-bold">{snippet.title}</h1>

          <p className="mt-1 text-muted-foreground">
            {snippet.pattern}
          </p>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Select defaultValue={snippet.language}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Code */}
      <pre className="mt-16 whitespace-pre-wrap font-mono text-xl leading-9 text-muted-foreground">
        <code>{snippet.code}</code>
      </pre>
    </main>
  );
}