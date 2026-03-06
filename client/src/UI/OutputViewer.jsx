import ReactMarkdown from 'react-markdown';

export default function OutputViewer({ data }) {
    if (!data) return null;

    return (
        <div className="space-y-10 text-gray-200 text-base leading-relaxed">
            {Object.entries(data).map(([key, value]) => {
                if (key === "diagrams") return null;
                return <DynamicSection key={key} title={key} value={value} />;
            })}
        </div>
    );
}

/* ---------- SECTION RENDERER ---------- */

function DynamicSection({ title, value }) {
    return (
        <div>
            {/* SECTION TITLE */}
            <h2 className="text-yellow-400 font-semibold text-lg mb-4 capitalize">
                {formatTitle(title)}
            </h2>

            {/* STRING */}
            {typeof value === "string" && (
                <div className="text-zinc-300">
                    <ReactMarkdown 
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-6 mb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mt-5 mb-3" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-medium text-white mt-4 mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-6 space-y-2 mb-4" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-6 space-y-2 mb-4" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 whitespace-pre-wrap" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />
                        }}
                    >
                        {value}
                    </ReactMarkdown>
                </div>
            )}

            {/* ARRAY */}
            {Array.isArray(value) && <BulletList items={value} />}

            {/* OBJECT */}
            {typeof value === "object" && !Array.isArray(value) && (
                <KeyValueList obj={value} />
            )}
        </div>
    );
}

/* ---------- HELPERS ---------- */

function BulletList({ items }) {
    return (
        <ul className="list-disc ml-6 space-y-2">
            {items.map((item, i) => (
                <li key={i}>{String(item)}</li>
            ))}
        </ul>
    );
}

function KeyValueList({ obj }) {
    return (
        <ul className="list-disc ml-6 space-y-2">
            {Object.entries(obj).map(([key, value]) => {
                if (key === "raw") return null;
                return (
                    <li key={key}>
                        <span className="font-semibold capitalize text-white">
                            {formatTitle(key)}:
                        </span>{" "}
                        <span className="text-zinc-300">{renderValue(value)}</span>
                    </li>
                );
            })}
        </ul>
    );
}

function renderValue(value) {
    if (Array.isArray(value)) {
        return value.join(", ");
    }
    if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
    }
    return String(value);
}

function formatTitle(key) {
    return key.replace(/_/g, " ");
}
