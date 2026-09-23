from sqlalchemy.orm import Session
from app.models.rbac import Role, Permission

# Standard Roles
ROLES = ["INVESTOR", "OFFICER", "POLICY_ADMIN"]

# Baseline Permissions for Demonstration
PERMISSIONS = [
    "view_audit",
    "manage_users",
    "view_applications",
    "edit_applications",
    "review_applications",
]

ROLE_PERMISSIONS_MAP = {
    "INVESTOR": ["view_applications", "edit_applications"],
    "OFFICER": ["view_applications", "review_applications"],
    "POLICY_ADMIN": PERMISSIONS,  # Highest-privilege role, has everything
}


def seed_rbac(db: Session):
    print("Seeding RBAC roles and permissions...")

    # 1. Seed Permissions
    perm_objs = {}
    for p_name in PERMISSIONS:
        perm = db.query(Permission).filter(Permission.name == p_name).first()
        if not perm:
            perm = Permission(name=p_name, description=f"Allows {p_name}")
            db.add(perm)
            db.commit()
            db.refresh(perm)
        perm_objs[p_name] = perm

    # 2. Seed Roles
    role_objs = {}
    for r_name in ROLES:
        role = db.query(Role).filter(Role.name == r_name).first()
        if not role:
            role = Role(name=r_name, description=f"{r_name} role")
            db.add(role)
            db.commit()
            db.refresh(role)
        role_objs[r_name] = role

    # 3. Seed Role-Permissions Mapping
    for role_name, perms in ROLE_PERMISSIONS_MAP.items():
        role = role_objs[role_name]
        for p_name in perms:
            perm = perm_objs[p_name]
            if perm not in role.permissions:
                role.permissions.append(perm)

    db.commit()
    print("RBAC seeding complete.")
