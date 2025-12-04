// Viz graph viewer {
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
// }

function createDirectoryStructure(directoryStructure, parentElement) {
    directoryStructure.forEach(item => {
      if (item.type === 'directory') {
        const directoryElement = document.createElement('div');
        directoryElement.classList.add('directory');
        directoryElement.textContent = item.name;
        directoryElement.style.setProperty("margin-left", "20px");
        directoryElement.style.setProperty("cursor", "pointer");
        
        parentElement.appendChild(directoryElement);
        
        // Create a container for the children of this directory (which will be hidden or shown)
        const childrenContainer = document.createElement('div');
        //childrenContainer.style.display = 'none'; // Initially hidden
        childrenContainer.style.display = 'block';
        directoryElement.appendChild(childrenContainer);
        
        // Recursively create the directory content
        createDirectoryStructure(item.children, childrenContainer);
      } else if (item.type === 'file') {
        const fileElement = document.createElement('div');
        fileElement.classList.add('file');
        fileElement.textContent = "--" + item.name;
        fileElement.style.setProperty("margin-left", "20px");
        fileElement.style.setProperty("cursor", "pointer");
        
        // When a file is clicked, display its content
        fileElement.addEventListener('click', () => {
          const filePath = `/graph_data/${item.path}`;
          // console.log(filePath);
          fetch(filePath)
            .then(response => response.text())
            .then(data => {
              createVisGraph(data, "visGraph");
            })
            .catch(error => console.error('Error fetching data:', error));
        });

        parentElement.appendChild(fileElement);
      }
    });
}

function createVisGraph(data, elementName) {

  // DOT language string (your network definition)
  var dotString = `${data}`;
  // console.log(dotString);

  Module.ABORTING_MALLOC = 0; // Prevent malloc failures from aborting the program

  // Set the initial memory size to a larger value
  Module.TOTAL_MEMORY = 1024 * 1024 * 1024;  // Set initial memory to 512MB

  // Modify the Module object to enable memory growth
  Module.ALLOW_MEMORY_GROWTH = true;  // Enable dynamic memory growth
  
  // Use Viz.js to render the DOT string into SVG
  const viz = new Viz({ Module, render });
  viz.renderSVGElement(dotString)
    .then(function(svgElement) {
      const resizeToScreenWidth = true;
      if (resizeToScreenWidth) {
        // Get original dimensions
        const width = svgElement.getAttribute('width');
        const height = svgElement.getAttribute('height');

        // Remove fixed width/height so it can scale
        svgElement.removeAttribute('width');
        svgElement.removeAttribute('height');

        // Set responsive attributes
        svgElement.setAttribute('viewBox', `0 0 ${parseFloat(width)} ${parseFloat(height)}`);
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgElement.style.width = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.display = 'block';
      }

      const svg = svgElement;

      const element = document.getElementById(elementName);
      element.innerHTML = '';
      element.appendChild(svg);

      svg.querySelectorAll('g.node').forEach(function(node) {
        // Add content
        const title = node.querySelector('title');
        const nodeId = title.textContent;
        node.dataset.originalSortedNodeId = nodeId;
      });

      // Add hover effect to nodes
      svg.querySelectorAll('g.node').forEach(function(node) {

        // Add content
        const title = node.querySelector('title');
        const curr_node = title.textContent;

        // Find the actual shape (polygon, ellipse, etc.)
        const shape = node.querySelector('polygon, ellipse, circle');

        if (!shape) return;

        // Save the original fill
        // const originalFill = shape.getAttribute('fill') || '#ffffff';
        const originalStroke = shape.getAttribute('stroke') || '';
        const originalStrokeWidth = shape.getAttribute('stroke-width') || '';

        // Find all edges in the graph
        const edges = svg.querySelectorAll('g.edge');

        node.addEventListener('mouseenter', function() {
          // node.style.fill = '#f00'; // Change color on hover
          // shape.setAttribute('fill', 'skyblue');
          shape.setAttribute('stroke', 'black');
          shape.setAttribute('stroke-width', '8');

          // Change the color of the outgoing edges
          edges.forEach(function(edge) {
            // console.log(`edge:${edge}`);
            const edgeTitle = edge.querySelector('title');

            if (!edgeTitle) return;

            const titleText = edgeTitle.textContent.trim();

            // Expect "NodeX->NodeY"
            const match = titleText.match(/^(\w+)->(\w+)$/);
            if (!match) return;

            const source_node = match[1];
            const target_node = match[2];

            if (source_node === curr_node) {
              // console.log(`edgeTitle=${edgeTitle.textContent}`);

              // Find the actual line (path) and arrowhead (polygon)
              const path = edge.querySelector('path');
              const arrow = edge.querySelector('polygon');

              // Save original styles so we can restore them later
              if (path && !path.dataset.originalStroke) {
                path.dataset.originalStroke = path.getAttribute('stroke') || '';
                path.dataset.originalStrokeWidth = path.getAttribute('stroke-width') || '';
              }
              if (arrow && !arrow.dataset.originalStroke) {
                arrow.dataset.originalStroke = arrow.getAttribute('stroke') || '';
                arrow.dataset.originalFill = arrow.getAttribute('fill') || '';
                arrow.dataset.originalStrokeWidth = arrow.getAttribute('stroke-width') || '';
              }

              // Apply hover styles
              if (path) {
                path.setAttribute('stroke', 'black');
                path.setAttribute('stroke-width', '8');
              }
              if (arrow) {
                arrow.setAttribute('stroke', 'black');
                arrow.setAttribute('fill', 'black');
                arrow.setAttribute('stroke-width', '8');
              }

              // Highlight destination node
              const destNode = Array.from(svg.querySelectorAll('g.node')).find(n => {
                if (!n) return false;
                if (!n.dataset) return false;
                const mySortedId = n.dataset.originalSortedNodeId;
                if (mySortedId !== target_node) return false;
                return true;
              });

              // console.log(`${destNode}`);
              if (destNode) {
                const destShape = destNode.querySelector('polygon, ellipse, circle');
                if (destShape) {
                  // Save original color if not already saved
                  if (!destShape.dataset.originalStroke) {
                    destShape.dataset.originalStroke = destShape.getAttribute('stroke') || '';
                    destShape.dataset.originalStrokeWidth = destShape.getAttribute('stroke-width') || '';
                  }
                  destShape.setAttribute('stroke', 'black');
                  destShape.setAttribute('stroke-width', '8');
                }
              }
            }
          });
        });
        node.addEventListener('mouseleave', function() {
          if (!node.dataset || !node.dataset.selected || node.dataset.selected === "0") {
            // node.style.fill = ''; // Reset color when not hovered
            // shape.setAttribute('fill', originalFill);
            shape.setAttribute('stroke', originalStroke);
            shape.setAttribute('stroke-width', originalStrokeWidth);
          }

          // Reset the color of the outgoing edges
          edges.forEach(function(edge) {
            const edgeTitle = edge.querySelector('title');

            if (!edgeTitle) return;

            const titleText = edgeTitle.textContent.trim();

            // Expect "NodeX->NodeY"
            const match = titleText.match(/^(\w+)->(\w+)$/);
            if (!match) return;

            const source_node = match[1];
            const target_node = match[2];

            if (source_node === curr_node) {
              // Reset the edge color
              const path = edge.querySelector('path');
              const arrow = edge.querySelector('polygon');

              // Restore original stroke/fill
              if (!node.dataset || !node.dataset.selected || node.dataset.selected === "0") {
                if (path && path.dataset.originalStroke) {
                  path.setAttribute('stroke', path.dataset.originalStroke);
                  path.setAttribute('stroke-width', path.dataset.originalStrokeWidth);
                }
                if (arrow && arrow.dataset.originalStroke) {
                  arrow.setAttribute('stroke', arrow.dataset.originalStroke);
                  arrow.setAttribute('fill', arrow.dataset.originalFill);
                  arrow.setAttribute('stroke-width', arrow.dataset.originalStrokeWidth);
                }
              }

              // Reset destination node color
              const destNode = Array.from(svg.querySelectorAll('g.node')).find(n => {
                if (!n) return false;
                if (!n.dataset) return false;
                const mySortedId = n.dataset.originalSortedNodeId;
                if (mySortedId !== target_node) return false;
                return true;
              });

              if (destNode) {
                if (!destNode.dataset || !destNode.dataset.selected || destNode.dataset.selected === "0") {
                  const destShape = destNode.querySelector('polygon, ellipse, circle');
                  if (destShape && destShape.dataset.originalStroke) {
                    destShape.setAttribute('stroke', destShape.dataset.originalStroke);
                    destShape.setAttribute('stroke-width', destShape.dataset.originalStrokeWidth);
                  }
                }
              }
            }
          });
        });
        node.addEventListener('click', function() {
          if (!node.dataset || !node.dataset.selected || node.dataset.selected === "0") {
            node.dataset.selected = "1";
          } else {
            node.dataset.selected = "0";
          }
        });
      });
    })
    .catch(function(error) {
      console.error(error);
    });
}

{

  fetch("/graph_data/directoryStructure.json")
    .then(response => response.json())
    .then(data => {
      const parentElement = document.getElementById("fileExplorer");
      parentElement.innerHTML = '';
      createDirectoryStructure(data, parentElement);
    })
    .catch(error => console.error('Error fetching data:', error));
}
