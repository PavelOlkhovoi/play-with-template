import React, { useCallback } from "react";
import PropTypes from "prop-types";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Controls,
} from "reactflow";
import dagre from "dagre";

import "reactflow/dist/style.css";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const addStyleBylickedNode = (node, active) => {
  if (active) {
    return {
      ...node,
      style: { background: "#E1F1FF" },
    };
  } else {
    return {
      ...node,
      style: {},
    };
  }
};

export const LayoutFlow = ({
  backgroundColor = "blue",
  dataIn,
  extractor,
  rootText,
}) => {
  const data = extractor(dataIn, rootText);
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    data.initialNodesData,
    data.initialEdgesData
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const handleNodeClick = (event, node) => {
    console.log("clicked noda", node);
    const updatedNodeArr = nodes.map((n) => {
      if (n.id === node.id) {
        return addStyleBylickedNode(n, true);
      } else {
        return addStyleBylickedNode(n, false);
      }
    });
    setNodes(updatedNodeArr);
  };
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );
  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  return (
    <div
      style={{
        width: "1300px",
        height: "650px",
        backgroundColor: backgroundColor,
        padding: "1rem",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onConnect={onConnect}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Controls />
        <Panel position="top-right">
          <button onClick={() => onLayout("TB")}>vertical layout</button>
          <button onClick={() => onLayout("LR")}>horizontal layout</button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
const dataShape = {
  alkis_id: PropTypes.string,
  level: PropTypes.number,
  nachfolger_alkis_id: PropTypes.string,
  nachfolger_name: PropTypes.string,
  nachfolger_schluessel_id: PropTypes.number,
  schluessel_id: PropTypes.number,
  vorgaenger_alkis_id: PropTypes.string,
  vorgaenger_name: PropTypes.string,
  vorgaenger_schluessel_id: PropTypes.number,
};
LayoutFlow.propTypes = {
  backgroundColor: PropTypes.string,
  dataIn: PropTypes.arrayOf(PropTypes.shape(dataShape)),
  extractor: PropTypes.func,
  rootText: PropTypes.string,
};

LayoutFlow.defaultProps = {
  backgroundColor: null,
};
