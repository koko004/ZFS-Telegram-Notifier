# **App Name**: ZFS Notifier

## Core Features:

- Pool Management: Web dashboard for adding and managing remote ZFS pools to monitor, where users can specify the remote server details and pool name.
- Pool Status Display: Display detailed pool status including logs, disk status, SMART data, and topology with visual icons.
- Real-time Monitoring: Continuously monitor the health of the ZFS pools.
- Error Anomaly Detection: Use an anomaly detection tool to determine if the rate of reported errors is above baseline.
- Telegram Notifications: Send Telegram notifications when critical issues are detected (e.g., degraded pool, failing disk).
- Theme Toggle: Provide a dark/light mode toggle for user preference.

## Style Guidelines:

- Primary color: #4CAF50 (Green) for system health and reliability, providing a sense of stability. The hex color is based on a green in HSL space.
- Background color: #F0F4F0 (Light Gray), a desaturated green creating a clean, modern, and resource-efficient design appropriate for a monitoring dashboard. The hex color is based on a green in HSL space.
- Accent color: #3F51B5 (Indigo) to highlight important information or interactive elements, drawing attention without disrupting the overall aesthetic. The hex color is based on a color analogous to green in HSL space.
- Body and headline font: 'PT Sans' (sans-serif) for readability and a modern feel.
- Use clear and visually distinct icons to represent different components of the ZFS pools (disks, topology). Use color to provide an immediate overview of a pool's health and operational status
- Prioritize a lightweight, modern design, ensuring smooth performance on minimal resources, focusing on key metrics and system status