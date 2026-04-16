# Appointment Scheduling

<cite>
**Referenced Files in This Document**
- [Agenda.tsx](file://src/pages/Agenda.tsx)
- [Consultas.tsx](file://src/pages/Consultas.tsx)
- [Pacientes.tsx](file://src/pages/Pacientes.tsx)
- [Ordenes.tsx](file://src/pages/Ordenes.tsx)
- [Dashboard.tsx](file://src/pages/Dashboard.tsx)
- [Configuracion.tsx](file://src/pages/Configuracion.tsx)
- [index.ts](file://src/types/index.ts)
- [utils.ts](file://src/lib/utils.ts)
- [button.tsx](file://src/components/ui/button.tsx)
- [card.tsx](file://src/components/ui/card.tsx)
- [package.json](file://package.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the Appointment Scheduling system within the NexaMed frontend. It focuses on the interactive calendar interface, appointment status management, availability scheduling, and reminder system functionality. It also explains calendar view modes, drag-and-drop scheduling capabilities, conflict detection, and resource allocation. The documentation covers appointment types, duration management, provider availability, and patient capacity limits, along with integration points to patient management, consultation tracking, and notification systems. Administrative controls and approval workflows are included to provide a complete operational picture.

## Project Structure
The frontend is organized around feature-based pages and shared UI primitives:
- Pages: Agenda (calendar), Consultas (consultation tracking), Pacientes (patient registry), Ordenes (orders), Dashboard (overview), Configuracion (settings), Login (authentication)
- Shared UI: Button, Card, and other components
- Types: Strongly typed domain models for users, patients, consultations, orders, and appointments
- Utilities: Formatting helpers for dates and IDs

```mermaid
graph TB
subgraph "Pages"
A["Agenda.tsx"]
B["Consultas.tsx"]
C["Pacientes.tsx"]
D["Ordenes.tsx"]
E["Dashboard.tsx"]
F["Configuracion.tsx"]
G["Login.tsx"]
end
subgraph "UI Components"
U1["button.tsx"]
U2["card.tsx"]
end
subgraph "Types & Utils"
T1["index.ts"]
T2["utils.ts"]
end
A --> U1
A --> U2
A --> T1
A --> T2
B --> U1
B --> U2
B --> T1
B --> T2
C --> U1
C --> U2
C --> T1
C --> T2
D --> U1
D --> U2
D --> T1
D --> T2
E --> U1
E --> U2
E --> T1
E --> T2
F --> U1
F --> U2
F --> T1
F --> T2
```

**Diagram sources**
- [Agenda.tsx:1-178](file://src/pages/Agenda.tsx#L1-L178)
- [Consultas.tsx:1-231](file://src/pages/Consultas.tsx#L1-L231)
- [Pacientes.tsx:1-279](file://src/pages/Pacientes.tsx#L1-L279)
- [Ordenes.tsx:1-309](file://src/pages/Ordenes.tsx#L1-L309)
- [Dashboard.tsx:1-206](file://src/pages/Dashboard.tsx#L1-L206)
- [Configuracion.tsx:1-297](file://src/pages/Configuracion.tsx#L1-L297)
- [button.tsx:1-54](file://src/components/ui/button.tsx#L1-L54)
- [card.tsx:1-76](file://src/components/ui/card.tsx#L1-L76)
- [index.ts:1-128](file://src/types/index.ts#L1-L128)
- [utils.ts:1-44](file://src/lib/utils.ts#L1-L44)

**Section sources**
- [Agenda.tsx:1-178](file://src/pages/Agenda.tsx#L1-L178)
- [Consultas.tsx:1-231](file://src/pages/Consultas.tsx#L1-L231)
- [Pacientes.tsx:1-279](file://src/pages/Pacientes.tsx#L1-L279)
- [Ordenes.tsx:1-309](file://src/pages/Ordenes.tsx#L1-L309)
- [Dashboard.tsx:1-206](file://src/pages/Dashboard.tsx#L1-L206)
- [Configuracion.tsx:1-297](file://src/pages/Configuracion.tsx#L1-L297)
- [button.tsx:1-54](file://src/components/ui/button.tsx#L1-L54)
- [card.tsx:1-76](file://src/components/ui/card.tsx#L1-L76)
- [index.ts:1-128](file://src/types/index.ts#L1-L128)
- [utils.ts:1-44](file://src/lib/utils.ts#L1-L44)

## Core Components
- Interactive Calendar (Agenda): Provides month navigation, day selection, and daily schedule display with appointment entries and actions.
- Consultation Tracking (Consultas): Lists consultations with filtering by status and date, badges for type and status, and action menu.
- Patient Management (Pacientes): Patient registry with search, stats, and action menu for clinical workflows.
- Orders (Ordenes): Laboratory/imaging/interconsultation tracking with status badges and actions.
- Dashboard (Dashboard): Overview cards for today’s appointments, recent patients, and alerts/notifications.
- Configuration (Configuracion): Notification preferences and administrative settings.
- Types (index.ts): Domain models for users, patients, consultations, orders, and appointments.
- Utilities (utils.ts): Date formatting, datetime formatting, age calculation, and ID generation.

**Section sources**
- [Agenda.tsx:34-177](file://src/pages/Agenda.tsx#L34-L177)
- [Consultas.tsx:77-230](file://src/pages/Consultas.tsx#L77-L230)
- [Pacientes.tsx:93-279](file://src/pages/Pacientes.tsx#L93-L279)
- [Ordenes.tsx:81-309](file://src/pages/Ordenes.tsx#L81-L309)
- [Dashboard.tsx:62-201](file://src/pages/Dashboard.tsx#L62-L201)
- [Configuracion.tsx:19-297](file://src/pages/Configuracion.tsx#L19-L297)
- [index.ts:1-128](file://src/types/index.ts#L1-L128)
- [utils.ts:1-44](file://src/lib/utils.ts#L1-L44)

## Architecture Overview
The system follows a component-driven architecture with page-level components rendering lists, forms, and dashboards. Shared UI components encapsulate styling and behavior. Data models define the domain entities. Utilities centralize formatting and calculations. The calendar page orchestrates date navigation and day selection, while other pages integrate with these models and utilities.

```mermaid
graph TB
UI["UI Components<br/>button.tsx, card.tsx"]
Types["Domain Types<br/>index.ts"]
Utils["Utilities<br/>utils.ts"]
Pages["Page Components<br/>Agenda.tsx, Consultas.tsx,<br/>Pacientes.tsx, Ordenes.tsx,<br/>Dashboard.tsx, Configuracion.tsx"]
UI --> Pages
Types --> Pages
Utils --> Pages
Pages --> Types
Pages --> Utils
```

**Diagram sources**
- [button.tsx:1-54](file://src/components/ui/button.tsx#L1-L54)
- [card.tsx:1-76](file://src/components/ui/card.tsx#L1-L76)
- [index.ts:1-128](file://src/types/index.ts#L1-L128)
- [utils.ts:1-44](file://src/lib/utils.ts#L1-L44)
- [Agenda.tsx:1-178](file://src/pages/Agenda.tsx#L1-L178)
- [Consultas.tsx:1-231](file://src/pages/Consultas.tsx#L1-L231)
- [Pacientes.tsx:1-279](file://src/pages/Pacientes.tsx#L1-L279)
- [Ordenes.tsx:1-309](file://src/pages/Ordenes.tsx#L1-L309)
- [Dashboard.tsx:1-206](file://src/pages/Dashboard.tsx#L1-L206)
- [Configuracion.tsx:1-297](file://src/pages/Configuracion.tsx#L1-L297)

## Detailed Component Analysis

### Interactive Calendar Interface (Agenda)
The calendar page provides:
- Month navigation with previous/next buttons
- Calendar grid showing days of the month with indicators for days with appointments
- Day selection highlighting and dynamic schedule panel
- Appointment entries with time, duration, patient, type, and status badges
- Action menu per appointment (view, edit, cancel)

```mermaid
sequenceDiagram
participant User as "User"
participant Calendar as "Agenda Calendar"
participant Scheduler as "Day Schedule Panel"
User->>Calendar : Click Previous/Next Month
Calendar->>Calendar : Update current month
User->>Calendar : Click a date
Calendar->>Scheduler : Set selected date
Scheduler->>Scheduler : Render appointments for selected date
User->>Scheduler : Open action menu
Scheduler-->>User : Show options (view, edit, cancel)
```

**Diagram sources**
- [Agenda.tsx:34-177](file://src/pages/Agenda.tsx#L34-L177)

Key behaviors:
- Navigation uses date-fns to compute month boundaries and iterate days.
- Selected date drives the right-hand schedule panel.
- Status badges reflect appointment state (attended, pending, scheduled, canceled).

**Section sources**
- [Agenda.tsx:34-177](file://src/pages/Agenda.tsx#L34-L177)
- [utils.ts:17-26](file://src/lib/utils.ts#L17-L26)

### Appointment Status Management
Statuses are represented consistently across components:
- Calendar: attended, pending, scheduled, canceled
- Consultations: completed, in-progress, pending
- Orders: completed, pending, canceled

```mermaid
flowchart TD
Start(["Select Appointment"]) --> CheckStatus{"Status"}
CheckStatus --> |attended| ShowBadge1["Show 'Atendida' badge"]
CheckStatus --> |pending| ShowBadge2["Show 'Programada' badge"]
CheckStatus --> |scheduled| ShowBadge3["Show 'Programada' badge"]
CheckStatus --> |canceled| ShowBadge4["Show 'Cancelada' badge"]
CheckStatus --> |completed| ShowBadge5["Show 'Completada' badge"]
CheckStatus --> |in-progress| ShowBadge6["Show 'En curso' badge"]
ShowBadge1 --> End(["Render"])
ShowBadge2 --> End
ShowBadge3 --> End
ShowBadge4 --> End
ShowBadge5 --> End
ShowBadge6 --> End
```

**Diagram sources**
- [Agenda.tsx:45-54](file://src/pages/Agenda.tsx#L45-L54)
- [Consultas.tsx:106-118](file://src/pages/Consultas.tsx#L106-L118)
- [Ordenes.tsx:115-130](file://src/pages/Ordenes.tsx#L115-L130)

**Section sources**
- [Agenda.tsx:45-54](file://src/pages/Agenda.tsx#L45-L54)
- [Consultas.tsx:106-118](file://src/pages/Consultas.tsx#L106-L118)
- [Ordenes.tsx:115-130](file://src/pages/Ordenes.tsx#L115-L130)

### Availability Scheduling and Provider Allocation
Provider availability and allocation are modeled via domain types:
- User: role-based access (admin, doctor, assistant)
- Cita: appointment entity with date/time, duration, status, and associated patient/provider
- Consulta: consultation record linked to patient and professional

```mermaid
classDiagram
class User {
+string id
+string email
+string name
+string role
}
class Cita {
+string id
+string pacienteId
+string profesionalId
+string fechaHora
+number duracion
+string estado
}
class Consulta {
+string id
+string pacienteId
+string profesionalId
+string fecha
+string motivo
+string diagnostico
}
User <.. Cita : "provider/patient association"
User <.. Consulta : "provider/patient association"
Cita --> Consulta : "follow-up/consultation linkage"
```

**Diagram sources**
- [index.ts:1-128](file://src/types/index.ts#L1-L128)

**Section sources**
- [index.ts:1-128](file://src/types/index.ts#L1-L128)

### Reminder System and Notifications
Notification preferences are configurable in the settings page:
- New appointments
- Appointment reminders
- Lab results
- Pending patients
- System updates

```mermaid
flowchart TD
Pref["Notification Preferences"] --> NewAppt["New Appointment Alerts"]
Pref --> Reminders["Appointment Reminders"]
Pref --> LabResults["Lab Results Alerts"]
Pref --> PendingFollowup["Pending Follow-up Reminders"]
Pref --> SysUpdates["System Update Notifications"]
```

**Diagram sources**
- [Configuracion.tsx:164-193](file://src/pages/Configuracion.tsx#L164-L193)

**Section sources**
- [Configuracion.tsx:164-193](file://src/pages/Configuracion.tsx#L164-L193)

### Approval Workflow and Administrative Controls
Administrative controls are exposed in the configuration page:
- Profile settings (personal/professional info)
- Clinic information (address, hours)
- Security (password change, two-factor auth)
- Appearance customization (theme and accent color)

```mermaid
flowchart TD
Admin["Admin Controls"] --> Profile["Profile Settings"]
Admin --> Clinic["Clinic Information"]
Admin --> Security["Security & 2FA"]
Admin --> Appearance["Appearance & Theme"]
```

**Diagram sources**
- [Configuracion.tsx:19-297](file://src/pages/Configuracion.tsx#L19-L297)

**Section sources**
- [Configuracion.tsx:19-297](file://src/pages/Configuracion.tsx#L19-L297)

### Integration with Patient Management and Consultation Tracking
- Patient registry supports search and quick actions to create consultations.
- Consultation tracking integrates with patient records and orders.
- Dashboard surfaces today’s appointments and recent patients.

```mermaid
sequenceDiagram
participant Patient as "Patient Registry"
participant Consult as "Consultations"
participant Orders as "Orders"
participant Dash as "Dashboard"
Patient->>Consult : Create new consultation
Consult->>Orders : Generate orders (lab/imaging)
Dash->>Consult : Display today's consultations
Dash->>Patient : Show recent visits
```

**Diagram sources**
- [Pacientes.tsx:240-258](file://src/pages/Pacientes.tsx#L240-L258)
- [Consultas.tsx:150-212](file://src/pages/Consultas.tsx#L150-L212)
- [Ordenes.tsx:223-289](file://src/pages/Ordenes.tsx#L223-L289)
- [Dashboard.tsx:94-181](file://src/pages/Dashboard.tsx#L94-L181)

**Section sources**
- [Pacientes.tsx:240-258](file://src/pages/Pacientes.tsx#L240-L258)
- [Consultas.tsx:150-212](file://src/pages/Consultas.tsx#L150-L212)
- [Ordenes.tsx:223-289](file://src/pages/Ordenes.tsx#L223-L289)
- [Dashboard.tsx:94-181](file://src/pages/Dashboard.tsx#L94-L181)

## Dependency Analysis
External libraries and their roles:
- date-fns: calendar computations (month start/end, iteration, formatting)
- lucide-react: UI icons
- Radix UI: dropdown menus, tabs, avatars, separators, etc.
- Tailwind and class variance authority: styling and variants

```mermaid
graph LR
Pkg["package.json"]
DateFns["date-fns"]
Lucide["lucide-react"]
Radix["Radix UI"]
Tailwind["Tailwind + CVAs"]
Pkg --> DateFns
Pkg --> Lucide
Pkg --> Radix
Pkg --> Tailwind
```

**Diagram sources**
- [package.json:12-32](file://package.json#L12-L32)

**Section sources**
- [package.json:12-32](file://package.json#L12-L32)

## Performance Considerations
- Calendar rendering: The calendar iterates over days in the month; for large date ranges, virtualization or pagination could reduce DOM nodes.
- Filtering and sorting: Consultations and orders pages filter client-side; consider server-side filtering for large datasets.
- Badge rendering: Status badges are computed per item; memoization or caching can help if lists grow large.
- Date formatting: Centralized formatting utilities avoid repeated locale computations.

## Troubleshooting Guide
Common issues and resolutions:
- Incorrect date formatting: Verify locale usage and date inputs passed to formatting utilities.
- Missing status badges: Ensure status values match the expected keys in badge configuration maps.
- Action menu not appearing: Confirm dropdown components are properly imported and rendered.
- Notification preferences not saving: Validate form state and backend integration if applicable.

**Section sources**
- [utils.ts:8-26](file://src/lib/utils.ts#L8-L26)
- [Agenda.tsx:45-54](file://src/pages/Agenda.tsx#L45-L54)
- [Consultas.tsx:106-118](file://src/pages/Consultas.tsx#L106-L118)
- [Ordenes.tsx:115-130](file://src/pages/Ordenes.tsx#L115-L130)

## Conclusion
The Appointment Scheduling system provides a cohesive set of features centered on an interactive calendar, robust status management, and integrated workflows across patients, consultations, and orders. With configurable notifications and administrative controls, it supports efficient clinic operations. Future enhancements could include server-side filtering, drag-and-drop scheduling, and real-time conflict detection to further improve usability and reliability.