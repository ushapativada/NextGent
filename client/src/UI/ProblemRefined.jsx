export default function ProblemOverview({ data }) {
    if (!data) return null;

    const Section = ({ title, items }) => {
        if (!items || (Array.isArray(items) && items.length === 0)) return null;

        let list = [];

        if (Array.isArray(items)) {
            list = items.map(item => {
                if (typeof item === 'object' && item !== null) {
                    // Handle object in array (e.g. Risk object)
                    return item.risk || item.description || JSON.stringify(item);
                }
                return item;
            });
        } else if (typeof items === "object") {
            list = Object.entries(items).map(([k, v]) => {
                const val = typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
                return `${k}: ${val}`;
            });
        }

        return (
            <div className="space-y-2">
                <h3 className="text-sm font-slate-medium text-yellow-400">
                    {title}
                </h3>
                <ul className="list-disc font-slate list-inside text-sm text-gray-300 space-y-1">
                    {list.map((item, i) => (
                        <li key={i} className="break-words">{item}</li>
                    ))}
                </ul>
            </div>
        );
    };


    return (
        <div className="rounded-xl p-2 space-y-6">
            {/* Summary */}
            <div className="space-y-2">
                <h2 className="text-base font-slate-medium text-yellow-400">
                    Problem Summary
                </h2>
                <p className="text-sm font-slate text-gray-300 leading-relaxed">
                    {data.problem_summary}
                </p>
            </div>

            <Section title="In Scope" items={data.in_scope} />
            <Section title="Out of Scope" items={data.out_of_scope} />
            <Section title="Assumptions" items={data.assumptions} />
            <Section title="Constraints" items={data.constraints} />
            <Section title="Open Points" items={data.open_points} />
            <Section title="Key Risks" items={data.key_risks} />
        </div>
    );
}
