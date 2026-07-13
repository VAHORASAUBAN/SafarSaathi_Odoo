"""
Script to apply RBAC fixes to all remaining routers
"""
import re

# Trips router fixes
trips_fixes = [
    (r"(@router\.get\(\"\".*?\n.*?current_user:.*?Depends\()(auth\.get_current_active_user)", r"\1rbac.require_trip_view()"),
    (r"(@router\.get\(\"\{trip_id\}\".*?\n.*?current_user:.*?Depends\()(auth\.get_current_active_user)", r"\1rbac.require_trip_view()"),
    (r"(@router\.post\(\"\".*?\n.*?\n.*?current_user:.*?Depends\()(auth\.get_current_active_user)", r"\1rbac.require_trip_create()"),
    (r"(@router\.put.*?\n.*?\n.*?\n.*?current_user:.*?Depends\()(auth\.get_current_active_user)", r"\1rbac.require_trip_edit()"),
    (r"(@router\.post\(\"\{trip_id\}/dispatch\".*?\n.*?\n.*?\n.*?current_user:.*?Depends\()(auth\.get_current_active_user)", r"\1rbac.require_trip_edit()"),
    (r"(@router\.post\(\"\{trip_id\}/complete\".*?\n.*?\n.*?\n.*?current_user:.*?Depends\()(auth\.get_current_active_user)", r"\1rbac.require_trip_edit()"),
    (r"(@router\.post\(\"\{trip_id\}/cancel\".*?\n.*?\n.*?current_user:.*?Depends\()(auth\.get_current_active_user)", r"\1rbac.require_trip_delete()"),
]

def apply_fixes(filepath, import_fix, endpoint_fixes):
    """Apply RBAC fixes to a router file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add rbac import
    if 'rbac' not in content:
        content = content.replace(import_fix[0], import_fix[1])
    
    # Apply endpoint fixes - simpler approach
    content = content.replace('Depends(auth.get_current_active_user)', 'Depends(rbac.require_view())')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {filepath}")

# Define files and their fixes
files_to_fix = {
    "app/routers/trips.py": {
        "import": ("from .. import models, schemas, auth", "from .. import models, schemas, auth, rbac"),
        "replace_all": "auth.get_current_active_user"
    },
    "app/routers/maintenance.py": {
        "import": ("from .. import models, schemas, auth", "from .. import models, schemas, auth, rbac"),
        "replace_all": "auth.get_current_active_user"
    },
    "app/routers/fuel.py": {
        "import": ("from .. import models, schemas, auth", "from .. import models, schemas, auth, rbac"),
        "replace_all": "auth.get_current_active_user"
    },
    "app/routers/expenses.py": {
        "import": ("from .. import models, schemas, auth", "from .. import models, schemas, auth, rbac"),
        "replace_all": "auth.get_current_active_user"
    },
}

print("🔧 Applying RBAC fixes to routers...")
print("Note: This is a simple replacement - manual review recommended")
print("="*60)

for filepath, fixes in files_to_fix.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add rbac import
        if 'rbac' not in content:
            content = content.replace(fixes["import"][0], fixes["import"][1])
        
        # Note: We're NOT doing blanket replacement here
        # Each router needs specific RBAC functions
        # This script just adds the import
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Added rbac import to {filepath}")
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")

print("="*60)
print("✅ RBAC imports added")
print("⚠️  Manual update still needed for endpoint-specific permissions")
print("   Use the RBAC_IMPLEMENTATION_STATUS.md file as a guide")
