export function Breadcrumbs({ items = [] }) {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
        <nav aria-label="Breadcrumb" className="breadcrumbs">
            <ol itemScope itemType="https://schema.org/BreadcrumbList" className="flex flex-wrap gap-2 text-sm text-gray-600">
                {items.map((item, index) => (
                    <li
                        key={index}
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                        className="flex items-center"
                    >
                        {item.href ? (
                            <a href={item.href} itemProp="item" className="hover:underline">
                                <span itemProp="name">{item.name}</span>
                            </a>
                        ) : (
                            <span itemProp="name">{item.name}</span>
                        )}
                        <meta itemProp="position" content={String(index + 1)} />
                        {index < items.length - 1 && <span className="mx-2 text-gray-400">/</span>}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
