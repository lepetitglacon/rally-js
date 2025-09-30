bl_info = {
    "name": "Rally Map Exporter",
    "author": "petitglacon",
    "blender": (4, 0, 0),
    "category": "Import-Export",
}

import importlib
from . import operators

def register():
    importlib.reload(operators)
    operators.register()

def unregister():
    operators.unregister()

if __name__ == "__main__":
    register()