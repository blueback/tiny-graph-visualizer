import os
import json

def get_directory_structure(path):
    # Helper function to recursively traverse directories
    def recurse_directory(current_path):
        # Initialize the result for the current directory
        dir_object = {
            "type": "directory",
            "name": os.path.basename(current_path),
            "path": current_path.removeprefix(target_directory),
            "children": []
        }
        
        # List files and directories in the current directory
        try:
            with os.scandir(current_path) as entries:
                for entry in entries:
                    if entry.is_dir():  # If the entry is a directory, recurse into it
                        dir_object["children"].append(recurse_directory(entry.path))
                    elif entry.is_file():  # If the entry is a file, add it to the children
                        dir_object["children"].append({
                            "type": "file",
                            "name": entry.name,
                            "path": os.path.join(current_path, entry.name).removeprefix(target_directory)
                        })
        except PermissionError:
            # Handle the case where the script doesn't have permission to read the directory
            pass

        return dir_object

    # Start recursion from the root path
    return [recurse_directory(path)]

def save_structure_to_json(path, output_file):
    # Get the directory structure in the required format using recursion
    structure = get_directory_structure(path)

    # Save the structure to a JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(structure, f, indent=4)

# Example usage
target_directory = 'live-documentation-frontend-bundle/public/graph_data/.'  # Replace with your target directory path
output_json_file = 'live-documentation-frontend-bundle/public/graph_data/directoryStructure.json'  # Output file name

save_structure_to_json(target_directory, output_json_file)

