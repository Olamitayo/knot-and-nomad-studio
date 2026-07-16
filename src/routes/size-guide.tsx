import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/size-guide")({ component: SizeGuidePage });

const guides = [
  {
    title: "Tops, shirts & jackets",
    columns: ["Size", "Chest", "Shoulder", "Sleeve", "Length", "Fit Guide"],
    rows: [
      ["S", "36–38", "17", "24", "27", "Close / regular"],
      ["M", "39–41", "18", "25", "28", "Regular"],
      ["L", "42–44", "19", "26", "29", "Relaxed"],
      ["XL", "45–47", "20", "27", "30", "Relaxed"],
    ],
  },
  {
    title: "Trousers & bottoms",
    columns: ["Size", "Waist", "Hip", "Thigh", "Inseam", "Length", "Fit Guide"],
    rows: [
      ["S", "28–30", "38", "23", "31", "41", "Close waist"],
      ["M", "31–33", "41", "24", "31", "42", "Regular"],
      ["L", "34–36", "44", "26", "32", "43", "Relaxed"],
      ["XL", "37–40", "47", "28", "32", "44", "Relaxed"],
    ],
  },
  {
    title: "Native wear — custom measurements",
    columns: [
      "Chest",
      "Shoulder",
      "Sleeve",
      "Top Length",
      "Trouser Waist",
      "Trouser Length",
      "Neck / Cap / Agbada",
    ],
    rows: [["Required", "Required", "Required", "Required", "Required", "Required", "As relevant"]],
  },
];

function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
      <p className="eyebrow">Fit support</p>
      <h1 className="mt-4 font-display text-5xl lg:text-7xl">Size Guide</h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
        All measurements are in inches and serve as a starting point. Product-specific tables and
        fit notes take priority.
      </p>
      <div className="mt-14 space-y-12">
        {guides.map((guide) => (
          <section key={guide.title}>
            <h2 className="font-display text-2xl">{guide.title}</h2>
            <div className="mt-5 overflow-x-auto border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {guide.columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap px-4 py-3 text-xs uppercase tracking-[0.12em]"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.rows.map((row, index) => (
                    <tr key={index} className="border-t border-border">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="whitespace-nowrap px-4 py-4 text-muted-foreground"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
      <div className="mt-14 border border-accent/30 bg-accent/5 p-6 text-sm leading-7">
        <strong>How to measure:</strong> Keep the tape level and comfortably close to the body. For
        wide-leg trousers, prioritise waist and desired full length. For native wear, send the
        complete measurement set through the Custom Order form.
      </div>
    </div>
  );
}
