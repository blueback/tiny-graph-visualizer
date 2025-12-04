Steps for Graph visualization:-
===============================

1. Put your folders containing dot files in the following sub-directory:-

        // These folders should contain your graphs in dot format files.
        cp folder1 live-documentation-frontend-bundle/public/graph_data/.
        cp folder2 live-documentation-frontend-bundle/public/graph_data/.
        ...
        // These can be nested folders also as follows

        graph_data
        |
        |--folder1
        |  |
        |  |--subfolder1
        |  |  |
        |  |  |--file1.dot
        |  |  |__file2.dot
        |  |
        |  |__subfolder2
        |     |
        |     |_file3.dot
        |   
        |__folder2
           |
           |__subfolder3
              |
              |_file4.dot

2. Run the server using the following script:-

        ./install_node_npm_vite.sh*
