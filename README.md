# ZFS Telegram Notifier

ZFS Telegram Notifier is a powerful, self-hosted application designed to monitor ZFS filesystems on remote servers. It provides a clean web-based dashboard to visualize the health of your ZFS pools and sends notifications to your Telegram account when issues are detected.

<img width="1366" height="633" alt="image" src="https://github.com/user-attachments/assets/1a2cce05-2c7a-4ddb-bb49-10029df54072" />


## Features

- **Remote ZFS Monitoring**: Connects to multiple remote servers via SSH to monitor ZFS pools.
- **Real-time Status**: View the real-time status of your ZFS pools, including vdevs, disks, and I/O statistics.
- **Telegram Notifications**: Receive instant alerts on Telegram for critical events like degraded or faulted pools, disk errors, and SMART failures.
- **AI-Powered Analysis**: Utilizes GenAI to analyze ZFS logs and SMART data to detect anomalies and provide insightful explanations.
- **Web-Based Dashboard**: A modern, responsive web interface to visualize and manage your ZFS pools.
- **Secure**: SSH connections are authenticated using private keys for enhanced security.

## Screenshots

<img width="1366" height="633" alt="image" src="https://github.com/user-attachments/assets/cbf1ea9c-0afb-4db6-b9c1-81d8c1800e96" />

<img width="1366" height="1677" alt="image" src="https://github.com/user-attachments/assets/564b4c63-6adf-4a73-8e57-d3b3c87ca828" />

<img width="1366" height="1606" alt="image" src="https://github.com/user-attachments/assets/e82e9545-43f8-4d0e-bbb3-756a8a7c8804" />

<img width="1366" height="633" alt="image" src="https://github.com/user-attachments/assets/1a2cce05-2c7a-4ddb-bb49-10029df54072" />

<img width="1366" height="1677" alt="image" src="https://github.com/user-attachments/assets/520696ac-3860-4571-9e41-9af0f16438d7" />

<img width="1366" height="1606" alt="image" src="https://github.com/user-attachments/assets/1c9b0e4d-a88a-48c5-844a-844b65cbf825" />

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Deployment

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/koko004/ZFS-Telegram-Notifier.git
    cd ZFS-Telegram-Notifier
    ```

2.  **Build and run the application:**

    ```sh
    docker-compose up -d --build
    ```

    This command will build the Next.js application, start the PostgreSQL database, and run the application in detached mode.

3.  **Access the application:**

    Open your web browser and navigate to `http://localhost:3000`.

### Configuration

All configuration is managed through the web interface.

1.  **Navigate to the Settings page** from the sidebar.
2.  **Configure Telegram Notifications**:
    -   Enter your Telegram Bot Token.
    -   Enter your Telegram Chat ID.
3.  **Configure AI-Powered Analysis**:
    -   Enter your Google AI API Key to enable AI-powered log and SMART data analysis.
4.  **Add ZFS Pools**:
    -   From the main dashboard, click on "Add Pool".
    -   Enter the remote server's SSH connection details (address, username, and private key) and the name of the ZFS pool to monitor.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for production.
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
- [Docker](https://www.docker.com/) - Containerization platform.
- [PostgreSQL](https://www.postgresql.org/) - Open source object-relational database.
- [Genkit](https://firebase.google.com/docs/genkit) - Open source framework for building AI-powered applications.
- [Shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
