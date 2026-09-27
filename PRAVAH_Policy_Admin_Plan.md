# PRAVAH Policy Admin Role - Implementation Plan

## Overview
The Policy Admin is the master configuration role for PRAVAH. This role is responsible for bridging the gap between state-level legislation (policies) and the actual services/clearances an investor applies for. 

This implementation plan focuses entirely on the **Frontend UI construction** for the Policy Admin role.

## 1. Updated Navigation Structure (Sidebar)
We will expand the existing Policy Admin sidebar to include "Service Management":
- **Dashboard** (`/policy/dashboard`)
- **Service Management**
  - Manage Services (`/policy/services`) - *NEW*
  - Configure Workflows (`/policy/workflows`) - *NEW*
- **Analytics**
  - Bottleneck Analytics (`/policy/bottlenecks`)
  - District Analysis (`/policy/districts`)
  - Sector Analysis (`/policy/sectors`)
  - Department Analysis (`/policy/departments`)
- **Policy Review**
  - Regulatory Impact (`/policy/regulatory`)

## 2. Frontend Theme & Aesthetic Guidelines
All new UI components will strictly adhere to the PRAVAH styling tokens defined in `theme.js`:
- **Colors**: Deep Navy (`C.navyDeep`), Bright Blue (`C.blue`), Saffron (`C.saffron`), Green (`C.green`).
- **Components**: We will heavily use `SectionHead`, `Btn`, standard cards (`bg-white shadow-sm rounded-xl`), and animated framer-motion page transitions.
- **Micro-interactions**: Hover effects on cards, clean table layouts, and subtle status badges.

## 3. Page-by-Page UI Specification

### 3.1 Policy Dashboard (`/policy/dashboard`)
- **Purpose**: High-level bird's-eye view.
- **UI Elements**: 
  - Top stat cards (Total Active Services, Pending Approvals, High-Risk Flags).
  - A summary chart showing "Applications by Sector" or "Average Processing Time".

### 3.2 Service Management - Manage Services (`/policy/services`)
- **Purpose**: A CRUD interface to define the services that appear in the Investor's `ApplyService.jsx` dropdown.
- **UI Elements**:
  - A data table listing current active services (e.g., "Factory Licence", "Environmental Clearance").
  - "Add New Service" button opening a modal to define Service Name, Department, Base Fee, and Active Status.

### 3.3 Service Management - Configure Workflows (`/policy/workflows`)
- **Purpose**: Visual interface to define the approval stages for a specific service.
- **UI Elements**:
  - A split view: Left side selects the Service, right side shows a drag-and-drop or sequential list of Stages (e.g. Document Verification -> Department Scrutiny -> Final Approval).

### 3.4 Analytics (Bottleneck, District, Sector, Department)
- **Purpose**: Data-driven insights to find where government processes are failing or succeeding.
- **UI Elements**:
  - Rich interactive charts (using `recharts` if installed, or visually stunning mock UI bars).
  - Filter bars (Date range, Department select).

### 3.5 Regulatory Impact (`/policy/regulatory`)
- **Purpose**: Reviewing how recent policy changes have impacted processing times or investment volume.
- **UI Elements**:
  - Timeline view of policy changes vs performance metrics.

## 4. Execution Steps (Frontend)
1. Update `config/navigation.js` to include the new Service Management routes.
2. Update `app/App.jsx` to mount the new route components (replacing `<UnderConstruction />`).
3. Build the `PolicyDashboard.jsx`.
4. Build `ManageServices.jsx` and `ConfigureWorkflows.jsx` for the core loop.
5. Build the Analytics stub pages (`BottleneckAnalytics.jsx`, etc.) with beautiful mock charts.
6. Connect all pages to the layout and ensure routing works seamlessly.

*Note: Data will be mocked in this phase until the backend implementation phase.*
