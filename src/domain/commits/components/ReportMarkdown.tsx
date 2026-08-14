import { Fragment } from 'react';

export default function ReportMarkdown({ markdown }: Readonly<{ markdown: string }>) {
  const blocks: React.ReactNode[] = [];

  let items: string[] = [];
  let key = 0;

  const flushItems = () => {
    if (items.length === 0) {
      return;
    }

    blocks.push(
      <ul key={key++} className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>,
    );

    items = [];
  };

  markdown.split('\n').forEach((line) => {
    if (line.startsWith('### ')) {
      flushItems();
      blocks.push(
        <h3 key={key++} className="text-primary mt-3 text-sm font-bold">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith('## ')) {
      flushItems();
      blocks.push(
        <h2 key={key++} className="mt-4 text-base font-bold first:mt-0">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('- ')) {
      items.push(line.slice(2));
    } else if (line.trim()) {
      flushItems();
      blocks.push(<p key={key++}>{line}</p>);
    }
  });

  flushItems();

  return <Fragment>{blocks}</Fragment>;
}
