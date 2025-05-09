import React, { useState } from 'react';

type LayoutNode = {
    id: string;
    type: 'row' | 'col';
    children: LayoutNode[];
};

let idCounter = 0;
const newId = () => `node_${idCounter++}`;

const createRow = (children: LayoutNode[] = []) => ({
    id: newId(),
    type: 'row' as const,
    children,
});

const createCol = (children: LayoutNode[] = []) => ({
    id: newId(),
    type: 'col' as const,
    children,
});

const PageBuilder = () => {
    const [layout, setLayout] = useState<LayoutNode[]>([]);

    const updateLayout = (newLayout: LayoutNode[]) => {
        setLayout([...newLayout]);
    };

    const renderNode = (node: LayoutNode, parent: LayoutNode[] | null, index: number) => {
        if (node.type === 'row') {
            return (
                <div key={node.id} className="border p-2 my-2 bg-light">
                    {/* + Above */}
                    <button onClick={() => {
                        if (!parent) return;
                        parent.splice(index, 0, createRow());
                        updateLayout(layout);
                    }}>+ Row Above</button>

                    <div className="d-flex gap-2 my-2">
                        {node.children.length === 0 ? (
                            <button onClick={() => {
                                node.children.push(createCol(), createCol());
                                updateLayout(layout);
                            }}>Add 2 Cols</button>
                        ) : (
                            node.children.map((child, i) =>
                                renderNode(child, node.children, i)
                            )
                        )}
                    </div>

                    {/* + Below */}
                    <button onClick={() => {
                        if (!parent) return;
                        parent.splice(index + 1, 0, createRow());
                        updateLayout(layout);
                    }}>+ Row Below</button>
                </div>
            );
        }

        if (node.type === 'col') {
            return (
                <div key={node.id} className="border p-2 flex-fill bg-white">
                    <button onClick={() => {
                        node.children.push(createRow());
                        updateLayout(layout);
                    }}>+ Row in Col</button>

                    <div>
                        {node.children.map((child, i) =>
                            renderNode(child, node.children, i)
                        )}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="p-4">
            {layout.length === 0 && (
                <button onClick={() => updateLayout([createRow()])}>+ Add Row</button>
            )}
            {layout.map((node, i) => renderNode(node, layout, i))}
        </div>
    );
};

export default PageBuilder;
